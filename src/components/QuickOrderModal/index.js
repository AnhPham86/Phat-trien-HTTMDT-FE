import React, { useState } from "react";
import {
  Modal, Form, Input, Select, Row, Col, Card, Divider, Button
} from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";

const { TextArea } = Input;
const { Option } = Select;

const QuickOrderModal = ({ open, onClose, product, user, onSuccess, onError }) => {
  const [shippingFee, setShippingFee] = useState(30000);
  const [vouchers, setVouchers] = useState([]);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const id = sessionStorage.getItem('id');

  // Load voucher khi modal mở
  React.useEffect(() => {
    if (open && product?.price) {
      const total = product.price + shippingFee;
      fetch(`/voucher/user/available?orderAmount=${total}`)
        .then(r => r.json())
        .then(d => setVouchers(d.data || []));
      setSelectedVoucher(null);
    }
  }, [open, product]);

  const handleShippingChange = (value) => {
    setShippingFee(value === "Giao tận nơi" ? 30000 : 0);
  };

  const handleFinish = async (values) => {
    Modal.confirm({
      title: "Xác nhận đặt hàng",
      icon: <ExclamationCircleOutlined />,
      content: "Bạn có chắc chắn muốn đặt hàng sản phẩm này không?",
      okText: "Xác nhận",
      cancelText: "Hủy",
      onOk: async () => {
        const orderPayload = {
          ...values,
          userId: id,
          voucherId: selectedVoucher?.id || null,
          orderItemRequests: [{
            productId: product.id,
            size: product.size,
            quantity: 1
          }]
        };

        try {
          const response = await fetch('/order/user/insert', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderPayload)
          });
          const data = await response.json();

          if (data.success) {
            if (values.paymentMethod === 'BANK') {
              const totalAmount = product.price + shippingFee;
              const bankRes = await fetch(`/payment/bank-info?orderId=${data.data?.id || Date.now()}&amount=${totalAmount}`);
              const bankData = await bankRes.json();
              if (bankData.success) {
                const info = bankData.data;
                onClose();
                Modal.info({
                  title: 'Thông tin chuyển khoản',
                  width: 500,
                  content: (
                    <div>
                      <p><strong>Ngân hàng:</strong> {info.bankName}</p>
                      <p><strong>Số tài khoản:</strong> {info.accountNumber}</p>
                      <p><strong>Chủ tài khoản:</strong> {info.accountName}</p>
                      <p><strong>Số tiền:</strong> {info.amount?.toLocaleString()} đ</p>
                      <p><strong>Nội dung CK:</strong> {info.content}</p>
                      <div style={{textAlign:'center', marginTop: 16}}>
                        <img src={info.qrCode} alt="QR Code" style={{width: 200}} />
                        <p style={{fontSize: 12, color: '#888'}}>Quét mã QR để chuyển khoản</p>
                      </div>
                    </div>
                  ),
                });
                return;
              }
            }
            onSuccess("Đặt hàng thành công");
            onClose();
          } else {
            onError("Đặt hàng thất bại");
          }
        } catch (e) {
          onError("Lỗi kết nối server");
        }
      }
    });
    onClose();
  };

  return (
    <Modal
      title={<div style={{ textAlign: "center", fontWeight: "bold", fontSize: "24px" }}>Đặt hàng ngay</div>}
      open={open}
      onCancel={onClose}
      width="80%"
      okButtonProps={{ form: "quickOrderForm", htmlType: "submit" }}
      okText="Đặt hàng"
      cancelText="Hủy"
      style={{ top: 10 }}
    >
      <Form
        id="quickOrderForm"
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{
          shippingMethod: "Giao tận nơi",
          deliveryTime: "08:00 - 09:00",
          paymentMethod: "COD",
          fullName: user?.fullName,
          phoneNumber: user?.phone,
          email: user?.email,
          address: user?.address,
        }}
      >
        <Row gutter={24}>
          <Col span={12}>
            <Card title="Thông tin đơn hàng" bordered={false} style={{ backgroundColor: "#fafafa" }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <img src={product?.image} alt={product?.name} style={{ width: 70, height: 70, objectFit: 'cover', borderRadius: 6 }} />
                <div>
                  <strong>{product?.name}</strong>
                  <p style={{ margin: 0, color: '#666', fontSize: 13 }}>Size: {product?.size}</p>
                  <p style={{ margin: 0, color: 'red' }}>{product?.price?.toLocaleString()} đ</p>
                </div>
              </div>
              <p><strong>Phí vận chuyển:</strong> {shippingFee.toLocaleString()} đ</p>
              <p><strong>Giảm giá voucher:</strong> <span style={{color:'red'}}>-{(selectedVoucher?.discountAmount || 0).toLocaleString()} đ</span></p>
              <p><strong>Tổng cộng:</strong> {((product?.price || 0) + shippingFee - (selectedVoucher?.discountAmount || 0)).toLocaleString()} đ</p>
              <Divider />
              {vouchers.length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  <p><strong>Chọn voucher:</strong></p>
                  <Select
                    style={{ width: '100%' }}
                    placeholder="-- Chọn voucher giảm giá --"
                    allowClear
                    onChange={(val) => {
                      if (!val) { setSelectedVoucher(null); return; }
                      setSelectedVoucher(vouchers.find(v => v.id === val) || null);
                    }}
                    value={selectedVoucher?.id || undefined}
                  >
                    {vouchers.map(v => (
                      <Option key={v.id} value={v.id} disabled={!v.canUse}>
                        <span style={{ fontWeight: 'bold', color: v.canUse ? '#1890ff' : '#aaa', marginRight: 8 }}>{v.code}</span>
                        <span style={{ color: '#666', fontSize: 12 }}>{v.description}</span>
                        {!v.canUse && <span style={{ color: '#ff4d4f', fontSize: 11, marginLeft: 8 }}>(Đơn tối thiểu {v.minOrderAmount?.toLocaleString()}đ)</span>}
                        <span style={{ float: 'right', color: v.canUse ? 'red' : '#aaa', fontWeight: 'bold' }}>-{v.discountAmount?.toLocaleString()}đ</span>
                      </Option>
                    ))}
                  </Select>
                </div>
              )}
              {vouchers.length === 0 && <p style={{color:'#aaa', fontSize:12, marginBottom: 12}}>Không có voucher khả dụng</p>}
              <Form.Item name="shippingMethod" label="Hình thức giao nhận" rules={[{ required: true }]}>
                <Select onChange={handleShippingChange}>
                  <Option value="Giao tận nơi">Giao tận nơi</Option>
                  <Option value="Tự đến lấy">Tự đến lấy</Option>
                </Select>
              </Form.Item>
              <Form.Item name="deliveryTime" label="Thời gian lấy hàng" rules={[{ required: true }]}>
                <Select>
                  <Option value="08:00 - 09:00">08:00 - 09:00</Option>
                  <Option value="09:00 - 10:00">09:00 - 10:00</Option>
                  <Option value="10:00 - 11:00">10:00 - 11:00</Option>
                </Select>
              </Form.Item>
              <Form.Item name="note" label="Ghi chú">
                <TextArea placeholder="Nhập ghi chú" style={{ height: 50 }} />
              </Form.Item>
              <Form.Item name="paymentMethod" label="Phương thức thanh toán" rules={[{ required: true }]}>
                <Select>
                  <Option value="COD">Thanh toán khi nhận hàng (COD)</Option>
                  <Option value="BANK">Chuyển khoản ngân hàng</Option>
                </Select>
              </Form.Item>
            </Card>
          </Col>
          <Col span={12}>
            <Card title="Thông tin người nhận" bordered={false} style={{ backgroundColor: "#fafafa" }}>
              <Form.Item name="fullName" label="Họ và tên" rules={[{ required: true, message: "Vui lòng nhập họ tên!" }]}>
                <Input placeholder="Nhập họ và tên" />
              </Form.Item>
              <Form.Item name="phoneNumber" label="Số điện thoại" rules={[
                { required: true, message: "Vui lòng nhập số điện thoại!" },
                { pattern: /^(0[3|5|7|8|9])+([0-9]{8})$/, message: "⚠ Số điện thoại không hợp lệ! Phải là 10 chữ số bắt đầu bằng 03, 05, 07, 08, 09" }
              ]}>
                <Input placeholder="Nhập số điện thoại" maxLength={10} />
              </Form.Item>
              <Form.Item name="email" label="Email" rules={[{ required: true, type: "email", message: "Email không hợp lệ!" }]}>
                <Input placeholder="Nhập email" />
              </Form.Item>
              <Form.Item name="address" label="Địa chỉ" rules={[{ required: true, message: "Vui lòng nhập địa chỉ!" }]}>
                <TextArea placeholder="Nhập địa chỉ" />
              </Form.Item>
            </Card>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default QuickOrderModal;
