import React from 'react';
import { Layout, Menu } from 'antd';
import { ContactsOutlined, LogoutOutlined, ProductOutlined, RollbackOutlined, ShopOutlined, ShoppingCartOutlined, TagOutlined, UserOutlined } from '@ant-design/icons';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import './LayoutAdmin.scss';

const { Header, Footer, Sider, Content } = Layout;
function LayoutAdmin() {

  const navigate = useNavigate();

  const handleLogOut = () => {
    sessionStorage.clear();
    navigate('/admin')
  }

  return (
    <Layout className='layout-admin'>
      <Header className='header' style={{padding: "0px 20px"}}>
        <div className='header__dashboard animate__animated animate__lightSpeedInRight'>DashBoard</div>
      </Header>
      <Layout>
        <Sider className='sider'>
          <Menu
            theme="dark"
            mode="inline"
            items={[
              {
                key: '1',
                icon: <ShopOutlined />,
                label: <NavLink to='manage-shop'>Cửa hàng</NavLink>,
              },
              {
                key: '2',
                icon: <ProductOutlined />,
                label: <NavLink to='manage-products'>Sản phẩm</NavLink>,
              },
              {
                key: '3',
                icon: <ShoppingCartOutlined />,
                label: <NavLink to='manage-orders'>Đơn hàng</NavLink>,
              },
              {
                key: '4',
                icon: <UserOutlined />,
                label: <NavLink to='manage-users'>Người dùng</NavLink>,
              },
              {
                key: '5',
                icon: <ContactsOutlined />,
                label: <NavLink to='manage-contacts'>Liên hệ</NavLink>,
              },
              {
                key: '6',
                icon: <RollbackOutlined />,
                label: <NavLink to='manage-returns'>Trả hàng</NavLink>,
              },
              {
                key: '7',
                icon: <TagOutlined />,
                label: <NavLink to='manage-vouchers'>Voucher</NavLink>,
              }
            ]}
          />
          <div onClick={handleLogOut} className='sider__logout' style={{color: "white", fontSize: "18px"}}><LogoutOutlined /> Đăng xuất</div>
        </Sider>
        <Content className='content' style={{minHeight: "91vh", height: "auto", overflowY: "auto"}}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}
export default LayoutAdmin;