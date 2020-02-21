import React from "react";
import "../static/style/components/header.css";
import { Row, Col, Menu, Icon } from "antd";

const Header = () => (
  <div className="header">
    <Row type="flex" justify="center">
      <Col xs={24} sm={24} md={10} lg={10} xl={10}>
        <span className="header-logo"> 技术胖 </span>{" "}
        <span className="header-txt"> 专注前端开发, 每年100集免费视频。 </span>{" "}
      </Col>
      <Col className="memu-div" xs={0} sm={0} md={14} lg={8} xl={6}>
        <Menu mode="horizontal">
          <Menu.Item key="mail">
            <Icon type="mail" />
            Navigation One
          </Menu.Item>
        </Menu>
      </Col>
    </Row>
  </div>
);
export default Header;
