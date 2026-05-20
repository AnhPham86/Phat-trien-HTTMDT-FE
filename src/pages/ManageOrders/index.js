import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Tag,
  Modal,
  notification,
  Form,
  Select,
  Row,
  Col,
} from "antd";
import './ManageOrders.scss';

const { Option } = Select;

const ManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [filterStatus, setFilterStatus] = useState("Tất cả");

  const getOrders = async () => {
    const response = await fetch(`/order/admin/get/all`, {
      method: "GET",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
      },
    });
    const data = await response.json();
    setOrders(data.data.data.reverse());
    return data.data.data;
  };

  const patchOrder = async (updateOrder) => {
    const response = await fetch(
      `/order/admin/solve?orderId=${updateOrder.id}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
        },
      }
    );
    return await response.json();
  };

  useEffect(() => {
    getOrders();
  }, []);

  // Hàm nhận đơn
  const handleAcceptOrder = (orderId) => {
    Modal.confirm({
      title: "Xác nhận nhận đơn",
      content: "Bạn có chắc chắn muốn nhận đơn này không?",
      okText: "Xác nhận",
      cancelText: "Hủy",
      onOk: async () => {
        const updatedOrder = orders.find((order) => order.id === orderId);

        if (updatedOrder) {
          updatedOrder.status = "Đã nhận đơn";
          await patchOrder(updatedOrder);

          setOrders((prevOrders) =>
            prevOrders.map((order) =>
              order.id === orderId ? { ...order, status: "Đã nhận đơn" } : order
            )
          );

          notification.success({
            message: "Nhận đơn thành công",
            description: `Đơn hàng ${orderId} đã được chuyển sang trạng thái 'Đã nhận đơn'.`,
          });
        }
      },
    });
  };

  // Cột bảng
  const columns = [
    {
      title: "STT",
      dataIndex: "id",
      key: "id",
      render: (text, record, index) => index + 1, // Tự động đánh số thứ tự
    },
    {
      title: "Thông tin đơn hàng",
      key: "orderInfo",
      render: (_, record) => (
        <div>
          <h4><strong>Tên sản phẩm: </strong>{record.productName}</h4>
          <p><strong>Size: </strong>{record.productSize}</p>
          <p><strong>Số lượng: </strong>{record.productQuantity}</p>
          <p><strong>Tổng tiền:</strong> {(record.productPrice * record.productQuantity).toLocaleString()} đ</p>
        </div>
      ),
    },
    {
      title: "Thông tin người dùng",
      key: "userInfo",
      render: (_, record) => (
        <div>
          <p>
            <strong>Họ và tên:</strong> {record.fullName}
          </p>
          <p>
            <strong>SĐT:</strong> {record.phone}
          </p>
          <p>
            <strong>Email:</strong> {record.email}
          </p>
          <p>
            <strong>Địa chỉ:</strong> {record.address}
          </p>
        </div>
      ),
    },
    {
      title: "Thông tin giao hàng",
      key: "shippingInfo",
      render: (_, record) => (
        <div>
          <p>
            <strong>Hình thức:</strong> {record.shippingMethod}
          </p>
          <p>
            <strong>Thời gian:</strong> {record.pickupTime}
          </p>
          <p>
            <strong>Ghi chú:</strong> {record.notes}
          </p>
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "Chờ xử lý" ? "orange" : "green"}>{status}</Tag>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Button
          type="primary"
          onClick={() => handleAcceptOrder(record.id)}
          disabled={
            record.status === "Đã nhận đơn" || record.status === "Hoàn thành"
          } // Vô hiệu hóa nếu đã nhận đơn
        >
          Nhận đơn
        </Button>
      ),
    },
  ];

  const handleChangeFilterStatus = (e) => {
    console.log(e);
    setFilterStatus(e);
  };

  const handleFilterStatus = async () => {
    const data = await getOrders();
  
    const filteredOrders =
      filterStatus === "Tất cả"
        ? data
        : data.filter((order) => order.status === filterStatus);
  
    setOrders(filteredOrders);
  };
  

  return (
    <div>
      <h1 className="animate__animated animate__fadeInDown" style={{ textAlign: "center" }}>Quản lý đơn hàng</h1>
      <Form
        onFinish={handleFilterStatus}
        initialValues={{ status: "Tất cả" }} // Đặt giá trị mặc định cho trường status
        style={{ width: "300px" }}
      >
        <Row gutter={[20, 20]}>
          <Col xl={22}>
            <Form.Item
              label="Trạng thái đơn hàng"
              name="status"
              labelCol={{ style: { fontWeight: "bold" } }}
            >
              <Select
                onChange={handleChangeFilterStatus}
                placeholder="Chọn trạng thái đơn hàng"
              >
                <Option value="Tất cả">Tất cả</Option>
                <Option value="Chờ xử lý">Chờ xử lý</Option>
                <Option value="Đã nhận đơn">Đã nhận đơn</Option>
                <Option value="Hoàn thành">Hoàn thành</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col xl={2}>
            <Form.Item>
              <Button type="primary" htmlType="submit" className="add-find-product">
                Lọc
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>

      <Table
        dataSource={orders}
        columns={columns}
        className='customer-table'
        rowKey={(record, index) => `${record.id}-${index}`}
        bordered
        style={{ minWidth: "90%" }}
      />
    </div>
  );
};

export default ManageOrders;
