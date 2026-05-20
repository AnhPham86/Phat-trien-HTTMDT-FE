import { Button, Layout, Input, message } from 'antd';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { ShoppingCartOutlined, SettingOutlined } from '@ant-design/icons';
import './LayoutDefault.scss';
import Profile from '../../pages/Profile';
import { useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import axios from 'axios';

const { Header, Footer, Content } = Layout;

function LayoutDefault() {
  const navigate = useNavigate();
  const isLogin = useSelector(state => state.loginReducer);
  const token = sessionStorage.getItem('token');

  // State cho chatbot
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [userInput, setUserInput] = useState('');

  // Thêm tin nhắn chào mừng khi chatbot được mở lần đầu
  useEffect(() => {
    if (isChatOpen && chatMessages.length === 0) {
      setChatMessages([{ sender: 'bot', text: 'Chào mừng bạn đến với web bán giày của chúng tôi' }]);
    }
  }, [isChatOpen]);

  const handleToPageCarts = () => {
    if (isLogin || token) {
      navigate('/carts');
    } else {
      navigate('/login');
    }
  };

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  const handleSendMessage = async () => {
    if (!userInput.trim()) {
      message.error('Vui lòng nhập câu hỏi!');
      return;
    }

    const currentInput = userInput;
    setUserInput(''); // Clear ngay lập tức

    const newUserMessage = { sender: 'user', text: currentInput };
    setChatMessages(prevMessages => [...prevMessages, newUserMessage]);

    try {
      const response = await axios.post('http://localhost:8080/chatbot/message', null, {
        params: { message: currentInput },
      });

      const botResponse = response.data.data;
      setChatMessages(prevMessages => [...prevMessages, { sender: 'bot', text: botResponse }]);
    } catch (error) {
      console.error('Error calling chatbot API:', error);
      setChatMessages(prevMessages => [...prevMessages, { sender: 'bot', text: 'Có lỗi xảy ra, vui lòng thử lại sau!' }]);
    }
  };

  return (
    <Layout>
      <Header className='header'>
        <div className='header__logo animate__animated animate__lightSpeedInRight'>
          <NavLink to='/'>Logo</NavLink>
        </div>
        <div className='header__menu animate__animated animate__fadeInDown'>
          <NavLink to='/'>Trang chủ</NavLink>
          <NavLink to='/introduce'>Giới thiệu</NavLink>
          <NavLink to='/contact'>Liên hệ</NavLink>
        </div>
        <div className='header__action animate__animated animate__fadeInRight'>
          <div className='header__cart'>
            <Button onClick={handleToPageCarts}><ShoppingCartOutlined /></Button>
          </div>
          <div className='header__profile'><Profile /></div>
        </div>
      </Header>
      <Content style={{ minHeight: "90vh" }}>
        <Outlet />
      </Content>
      <Footer className="footer">
        <div className="footer__top">
          <div className="footer__top-left">
            <div className="footer__signup">
              <h4>Đăng Ký Nhận Tin</h4>
              <div className="footer__signup-form">
                <input type="email" placeholder="Email" />
                <Button className="footer__signup-button">Đăng Ký</Button>
              </div>
            </div>
            <div className="footer__social">
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"><i className="fab fa-linkedin"></i></a>
              <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer"><i className="fab fa-tiktok"></i></a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"><i className="fab fa-instagram"></i></a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"><i className="fab fa-facebook-f"></i></a>
            </div>
          </div>
        </div>
        <div className="footer__main">
          <div className="footer__section footer__intro">
            <h4>Giới Thiệu</h4>
            <p>Shop chúng tôi chuyên cung cấp, order các loại giày authentic từ các hãng Nike, Adidas, Puma, MLB...</p>
            <p>
              <strong>Địa chỉ:</strong>  Km10, đường Nguyễn Trãi, Phường Mộ Lao, Quận Hà Đông, Thành phố Hà Nội
            </p>
            <p><strong>Hotline:</strong> 0385328562</p>
            <p><strong>Email:</strong> <a href="mailto:bydeestore@gmail.com">doxuankhanh674@gmail.com</a></p>
          </div>
          <div className="footer__section footer__policy">
            <h4>Chính Sách</h4>
            <NavLink to="/policy/bao-mat">Chính sách bảo mật thông tin</NavLink>
            <NavLink to="/policy/thanh-toan">Chính sách thanh toán</NavLink>
            <NavLink to="/policy/van-chuyen">Chính sách vận chuyển và giao nhận</NavLink>
            <NavLink to="/policy/kiem-hang">Chính sách kiểm hàng</NavLink>
            <NavLink to="/policy/doi-tra">Chính sách đổi trả</NavLink>
            <NavLink to="/policy/xu-ly-khieu-nai">Chính sách xử lý khiếu nại</NavLink>
            <NavLink to="/policy/bao-hanh">Chính sách bảo hành</NavLink>
          </div>
          <div className="footer__section footer__guide">
            <h4>Hướng Dẫn</h4>
            <NavLink to="/guide/order">Hướng dẫn order</NavLink>
            <NavLink to="/guide/mua-hang">Hướng dẫn mua hàng</NavLink>
            <NavLink to="/guide/dich-vu">Dịch khoản dịch vụ</NavLink>
            <NavLink to="/guide/san-pham">Tất cả sản phẩm</NavLink>
            <NavLink to="/guide/lien-he">Liên Hệ</NavLink>
          </div>
          <div className="footer__section footer__fanpage">
            <h4>Fanpage Chúng Tôi</h4>
            <div className="footer__fanpage-content">
              <a href='https://www.facebook.com/khahs.204?locale=vi_VN' target='_blank'><img src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Facebook_logo_36x36.svg/1024px-Facebook_logo_36x36.svg.png" alt="Fanpage" /></a>
            </div>
            <Button className="footer__share-button">Chia Sẻ</Button>
          </div>
        </div>
        <div className="footer__bottom">
          <p>© Copyright 2025 </p>
        </div>
      </Footer>

      {/* Chatbot */}
      <div className="chatbot-container">
        <Button
          className="chatbot-toggle"
          type="primary"
          shape="circle"
          icon={<img src="https://cdn.dribbble.com/userupload/27768490/file/original-ad7b62eb0a3ea8aa2a97963807445369.png?resize=752x&vertical=center" alt="Chatbot Logo" style={{ width: '40px', height: '40px' }} />}
          onClick={toggleChat}
        />
        {isChatOpen && (
          <div className="chatbot-window">
            <div className="chatbot-header">
              <span>Chatbot Hỗ Trợ</span>
              <Button type="text" onClick={toggleChat}>X</Button>
            </div>
            <div className="chatbot-messages">
              {chatMessages.map((msg, index) => (
                <div key={index} className={`chatbot-message ${msg.sender}`}>
                  <span>{msg.text}</span>
                </div>
              ))}
            </div>
            <div className="chatbot-input">
              <Input
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Nhập câu hỏi của bạn..."
                onPressEnter={handleSendMessage}
              />
              <Button type="primary" onClick={handleSendMessage}>Gửi</Button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default LayoutDefault;