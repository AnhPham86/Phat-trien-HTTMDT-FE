import { Button, Image, Modal, Input, Table, Tag, Typography, notification } from "antd";
import { useEffect, useState } from "react";

const { TextArea } = Input;

function History() {
  const [productsInHistory, setProductsInHistory] = useState([]);
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [reason, setReason] = useState("");
  const userId = sessionStorage.getItem('id');

  const [api, contextHolder] = notification.useNotification();
  const openNotification = (message, description, type) => {
    api[type]({ message, description, duration: 2 });
  };

  const getProductsInHistory = async () => {
    const response = await fetch(`/order/user/get?userId=${userId}`);
    const data = await response.json();
    setProductsInHistory(data.data.reverse());
  };

  useEffect(() => { getProductsInHistory(); }, []);

  const handleReturnRequest = (record) => {
    setSelectedOrder(record);
    setReason("");
    setReturnModalOpen(true);
  };

  const handleSubmitReturn = async () => {
    if (!reason.trim()) {
      openNotification("Lỗi", "Vui lòng nhập lý do trả hàng", "error");
      return;
    }
    const res = await fetch(
      `/return-request/user/create?orderId=${selectedOrder.id}&userId=${userId}&reason=${encodeURIComponent(reason)}`,
      { method: "POST" }
    );
    const data = await res.json();
    if (data.success) {
      openNotification("Thành công", "Đã gửi yêu cầu trả hàng", "success");
      setReturnModalOpen(false);
    } else {
      openNotification("Thất bại", data.description, "error");
    }
  };

  const columns = [
    {
      title: 'STT', key: 'index',
      render: (text, record, index) => index + 1,
      width: 60, align: 'center',
    },
    {
      title: 'Hình ảnh', dataIndex: 'productImage', key: 'productImage',
      render: (text) => <Image src={text} width={80} />
    },
    { title: 'Tên sản phẩm', dataIndex: 'productName', key: 'productName' },

    { title: 'Size', dataIndex: 'productSize', key: 'productSize' },
    {
      title: 'Giá', dataIndex: 'productPrice', key: 'productPrice',
      render: (price) => `${price}`
    },
    { title: 'Số lượng', dataIndex: 'productQuantity', key: 'productQuantity' },
    {
      title: 'Tổng tiền', key: 'totalPrice',
      render: (_, record) => (
        <Typography.Text strong>
          {record.productPrice * record.productQuantity}
        </Typography.Text>
      )
    },
    { title: 'Thời gian thanh toán', key: 'time', dataIndex: 'time' },
    {
      title: 'Trạng thái', key: 'status',
      render: (_, record) => (
        record.status === 'Chờ xử lý'
          ? <Tag color="orange">{record.status}</Tag>
          : <Tag color="#87d068">{record.status}</Tag>
      )
    },
    {
      title: 'Hành động', key: 'action',
      render: (_, record) => (
        <Button
          danger
          size="small"
          onClick={() => handleReturnRequest(record)}
        >
          Yêu cầu trả hàng
        </Button>
      )
    }
  ];

  return (
    <>
      {contextHolder}
      <div className="custom-table-container">
        <h1 style={{ marginTop: "0px" }}>Lịch sử mua hàng</h1>
        <Table
          columns={columns}
          dataSource={productsInHistory}
          rowKey="id"
          className="custom-table"
          pagination={{ pageSize: 5 }}
        />
      </div>

      <Modal
        title="Yêu cầu trả hàng"
        open={returnModalOpen}
        onCancel={() => setReturnModalOpen(false)}
        onOk={handleSubmitReturn}
        okText="Gửi yêu cầu"
        cancelText="Hủy"
      >
        <p><strong>Đơn hàng:</strong> #{selectedOrder?.id} - {selectedOrder?.productName}</p>
        <p><strong>Lý do trả hàng:</strong></p>
        <TextArea
          rows={4}
          placeholder="Nhập lý do trả hàng..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </Modal>
    </>
  );
}

export default History;
