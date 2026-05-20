import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input, InputNumber, Select, DatePicker, Tag, Space, notification, Switch } from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { Option } = Select;

const ManageVouchers = () => {
  const [vouchers, setVouchers] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();
  const [api, contextHolder] = notification.useNotification();

  const token = sessionStorage.getItem("token");
  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  const getVouchers = async () => {
    const res = await fetch("/voucher/admin/get/all", { headers });
    const data = await res.json();
    setVouchers((data.data || []).reverse());
  };

  useEffect(() => { getVouchers(); }, []);

  const openAdd = () => {
    setEditing(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (record) => {
    setEditing(record);
    form.setFieldsValue({
      ...record,
      startDate: record.startDate ? dayjs(record.startDate) : null,
      endDate: record.endDate ? dayjs(record.endDate) : null,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    const values = await form.validateFields();
    const payload = {
      ...values,
      id: editing?.id,
      startDate: values.startDate ? values.startDate.toISOString() : null,
      endDate: values.endDate ? values.endDate.toISOString() : null,
      usedCount: editing?.usedCount || 0,
      active: values.active !== undefined ? values.active : true,
    };
    const url = editing ? "/voucher/admin/update" : "/voucher/admin/create";
    const res = await fetch(url, { method: "POST", headers, body: JSON.stringify(payload) });
    const data = await res.json();
    if (data.success) {
      api.success({ message: editing ? "Cập nhật thành công" : "Tạo voucher thành công", duration: 2 });
      setModalOpen(false);
      getVouchers();
    }
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: "Xóa voucher này?",
      okText: "Xóa", okType: "danger", cancelText: "Hủy",
      onOk: async () => {
        await fetch(`/voucher/admin/delete?id=${id}`, { method: "DELETE", headers });
        api.success({ message: "Đã xóa voucher", duration: 2 });
        getVouchers();
      }
    });
  };

  const columns = [
    { title: "STT", key: "index", render: (_, __, i) => i + 1, width: 60, align: "center" },
    { title: "Mã voucher", dataIndex: "code", key: "code", render: (v) => <Tag color="blue">{v}</Tag> },
    { title: "Mô tả", dataIndex: "description", key: "description" },
    {
      title: "Giảm giá", key: "discount",
      render: (_, r) => r.discountType === "PERCENT"
        ? `${r.discountValue}% (tối đa ${r.maxDiscount?.toLocaleString() || "∞"}đ)`
        : `${r.discountValue?.toLocaleString()}đ`
    },
    { title: "Đơn tối thiểu", dataIndex: "minOrderAmount", key: "minOrderAmount", render: (v) => v ? `${v.toLocaleString()}đ` : "Không" },
    { title: "Lượt dùng", key: "usage", render: (_, r) => `${r.usedCount || 0}/${r.usageLimit || "∞"}` },
    { title: "Hết hạn", dataIndex: "endDate", key: "endDate", render: (v) => v ? new Date(v).toLocaleDateString("vi-VN") : "Không giới hạn" },
    {
      title: "Trạng thái", dataIndex: "active", key: "active",
      render: (v) => <Tag color={v ? "green" : "red"}>{v ? "Đang hoạt động" : "Đã tắt"}</Tag>
    },
    {
      title: "Thao tác", key: "action",
      render: (_, r) => (
        <Space>
          <EditOutlined style={{ color: "#1890ff", fontSize: 18, cursor: "pointer" }} onClick={() => openEdit(r)} />
          <DeleteOutlined style={{ color: "#ff4d4f", fontSize: 18, cursor: "pointer" }} onClick={() => handleDelete(r.id)} />
        </Space>
      )
    }
  ];

  return (
    <div>
      {contextHolder}
      <h1 className="animate__animated animate__fadeInDown" style={{ textAlign: "center" }}>Quản lý Voucher</h1>
      <Button type="primary" icon={<PlusOutlined />} onClick={openAdd} style={{ marginBottom: 16 }}>
        Thêm voucher
      </Button>
      <Table dataSource={vouchers} columns={columns} rowKey="id" bordered pagination={{ pageSize: 10 }} />

      <Modal
        title={editing ? "Chỉnh sửa voucher" : "Thêm voucher mới"}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSave}
        okText="Lưu"
        cancelText="Hủy"
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="code" label="Mã voucher" rules={[{ required: true, message: "Nhập mã voucher!" }]}>
            <Input placeholder="VD: SALE10" style={{ textTransform: "uppercase" }} />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <Input placeholder="VD: Giảm 10% cho đơn từ 500k" />
          </Form.Item>
          <Form.Item name="discountType" label="Loại giảm giá" rules={[{ required: true }]}>
            <Select placeholder="Chọn loại">
              <Option value="PERCENT">Phần trăm (%)</Option>
              <Option value="AMOUNT">Số tiền cố định (đ)</Option>
            </Select>
          </Form.Item>
          <Form.Item name="discountValue" label="Giá trị giảm" rules={[{ required: true, message: "Nhập giá trị!" }]}>
            <InputNumber style={{ width: "100%" }} min={1} placeholder="VD: 10 (%) hoặc 50000 (đ)" />
          </Form.Item>
          <Form.Item name="maxDiscount" label="Giảm tối đa (đ) - chỉ áp dụng cho loại %">
            <InputNumber style={{ width: "100%" }} min={0} placeholder="Để trống = không giới hạn" />
          </Form.Item>
          <Form.Item name="minOrderAmount" label="Đơn hàng tối thiểu (đ)">
            <InputNumber style={{ width: "100%" }} min={0} placeholder="Để trống = không yêu cầu" />
          </Form.Item>
          <Form.Item name="usageLimit" label="Số lượt dùng tối đa">
            <InputNumber style={{ width: "100%" }} min={1} placeholder="Để trống = không giới hạn" />
          </Form.Item>
          <Form.Item name="startDate" label="Ngày bắt đầu">
            <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
          </Form.Item>
          <Form.Item name="endDate" label="Ngày hết hạn">
            <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
          </Form.Item>
          <Form.Item name="active" label="Trạng thái" valuePropName="checked" initialValue={true}>
            <Switch checkedChildren="Hoạt động" unCheckedChildren="Tắt" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ManageVouchers;
