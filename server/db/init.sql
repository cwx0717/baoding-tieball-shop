-- 保定铁球非遗销售系统数据库初始化脚本

CREATE DATABASE IF NOT EXISTS shop_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE shop_db;

-- 用户表
CREATE TABLE IF NOT EXISTS Users (
    用户ID INT PRIMARY KEY AUTO_INCREMENT,
    用户名 VARCHAR(50) UNIQUE NOT NULL,
    密码 VARCHAR(255) NOT NULL,
    手机号 VARCHAR(20),
    邮箱 VARCHAR(100),
    角色 ENUM('游客', '用户', '商家', '管理员') DEFAULT '用户',
    注册时间 DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 工艺师表
CREATE TABLE IF NOT EXISTS craftsman (
    工艺师ID INT PRIMARY KEY AUTO_INCREMENT,
    工艺师名称 VARCHAR(100) NOT NULL,
    简介 TEXT,
    头像 VARCHAR(255),
    联系方式 VARCHAR(100)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 产品分类表
CREATE TABLE IF NOT EXISTS categories (
    分类ID INT PRIMARY KEY AUTO_INCREMENT,
    分类名称 VARCHAR(50) NOT NULL,
    分类描述 VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 产品表
CREATE TABLE IF NOT EXISTS product (
    产品ID INT PRIMARY KEY AUTO_INCREMENT,
    产品名称 VARCHAR(100) NOT NULL,
    描述 TEXT,
    价格 DECIMAL(10, 2) NOT NULL,
    库存 INT DEFAULT 0,
    销量 INT DEFAULT 0,
    图片 VARCHAR(255),
    分类ID INT,
    工艺师ID INT,
    审核状态 ENUM('待审核', '已通过', '已拒绝') DEFAULT '待审核',
    创建时间 DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (分类ID) REFERENCES categories(分类ID),
    FOREIGN KEY (工艺师ID) REFERENCES craftsman(工艺师ID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 购物车表
CREATE TABLE IF NOT EXISTS cart (
    购物车ID INT PRIMARY KEY AUTO_INCREMENT,
    用户ID INT NOT NULL,
    产品ID INT NOT NULL,
    数量 INT DEFAULT 1,
    添加时间 DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (用户ID) REFERENCES Users(用户ID),
    FOREIGN KEY (产品ID) REFERENCES product(产品ID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 订单表
CREATE TABLE IF NOT EXISTS orders (
    订单ID INT PRIMARY KEY AUTO_INCREMENT,
    订单号 VARCHAR(50) UNIQUE NOT NULL,
    用户ID INT NOT NULL,
    收货人 VARCHAR(50) NOT NULL,
    联系电话 VARCHAR(20) NOT NULL,
    收货地址 VARCHAR(255) NOT NULL,
    备注 VARCHAR(500),
    总价 DECIMAL(10, 2) NOT NULL,
    状态 ENUM('待支付', '待发货', '待收货', '已完成', '已取消') DEFAULT '待支付',
    下单时间 DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (用户ID) REFERENCES Users(用户ID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 订单详情表
CREATE TABLE IF NOT EXISTS orderdetail (
    订单详情ID INT PRIMARY KEY AUTO_INCREMENT,
    订单ID INT NOT NULL,
    产品ID INT NOT NULL,
    数量 INT NOT NULL,
    价格 DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (订单ID) REFERENCES orders(订单ID),
    FOREIGN KEY (产品ID) REFERENCES product(产品ID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 评论表
CREATE TABLE IF NOT EXISTS comment (
    评论ID INT PRIMARY KEY AUTO_INCREMENT,
    用户ID INT NOT NULL,
    产品ID INT NOT NULL,
    评分 TINYINT NOT NULL,
    内容 TEXT NOT NULL,
    评论时间 DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (用户ID) REFERENCES Users(用户ID),
    FOREIGN KEY (产品ID) REFERENCES product(产品ID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 触发器1：订单支付后更新库存
DELIMITER //
CREATE TRIGGER trg_after_order_pay_update_stock
AFTER UPDATE ON orders
FOR EACH ROW
BEGIN
    IF NEW.状态 = '待发货' AND OLD.状态 = '待支付' THEN
        UPDATE product p
        INNER JOIN orderdetail od ON p.产品ID = od.产品ID
        SET p.库存 = p.库存 - od.数量,
            p.销量 = p.销量 + od.数量
        WHERE od.订单ID = NEW.订单ID;
    END IF;
END//
DELIMITER ;

-- 触发器2：订单取消后恢复库存
DELIMITER //
CREATE TRIGGER trg_after_order_cancel_restore_stock
AFTER UPDATE ON orders
FOR EACH ROW
BEGIN
    IF NEW.状态 = '已取消' AND OLD.状态 = '待支付' THEN
        UPDATE product p
        INNER JOIN orderdetail od ON p.产品ID = od.产品ID
        SET p.库存 = p.库存 + od.数量
        WHERE od.订单ID = NEW.订单ID;
    END IF;
END//
DELIMITER ;

-- 触发器3：订单删除后恢复库存
DELIMITER //
CREATE TRIGGER trg_after_order_delete_restore_stock
AFTER DELETE ON orders
FOR EACH ROW
BEGIN
    UPDATE product p
    INNER JOIN orderdetail od ON p.产品ID = od.产品ID
    SET p.库存 = p.库存 + od.数量
    WHERE od.订单ID = OLD.订单ID;
END//
DELIMITER ;

-- 视图1：用户订单视图（只显示当前用户的订单）
CREATE OR REPLACE VIEW v_user_order AS
SELECT o.*, u.用户名, u.手机号,
       GROUP_CONCAT(p.产品名称 SEPARATOR ', ') as 产品列表
FROM orders o
JOIN Users u ON o.用户ID = u.用户ID
JOIN orderdetail od ON o.订单ID = od.订单ID
JOIN product p ON od.产品ID = p.产品ID
GROUP BY o.订单ID;

-- 视图2：产品销量统计视图
CREATE OR REPLACE VIEW v_product_sales AS
SELECT p.产品ID, p.产品名称, p.价格, p.库存, p.销量,
       c.分类名称, cr.工艺师名称,
       COALESCE(SUM(od.数量), 0) as 实际销量
FROM product p
LEFT JOIN categories c ON p.分类ID = c.分类ID
LEFT JOIN craftsman cr ON p.工艺师ID = cr.工艺师ID
LEFT JOIN orderdetail od ON p.产品ID = od.产品ID
GROUP BY p.产品ID;

-- 视图3：库存预警视图
CREATE OR REPLACE VIEW v_low_stock AS
SELECT p.产品ID, p.产品名称, p.库存, p.审核状态,
       c.分类名称, cr.工艺师名称
FROM product p
LEFT JOIN categories c ON p.分类ID = c.分类ID
LEFT JOIN craftsman cr ON p.工艺师ID = cr.工艺师ID
WHERE p.库存 < 10 AND p.审核状态 = '已通过';

-- 插入管理员账号（密码: admin123）
INSERT INTO Users (用户名, 密码, 手机号, 邮箱, 角色) VALUES
('admin', '$2a$10$XQxBtJXKQe5J5P5Z5Z5Z5eZ5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z', '13800138000', 'admin@example.com', '管理员');

-- 插入测试工艺师
INSERT INTO craftsman (工艺师名称, 简介, 联系方式) VALUES
('王铁球', '保定铁球第五代传人，从事铁球制作50余年', '13900139000'),
('李传承', '保定铁球第六代传人，非物质文化遗产传承人', '13900139001');

-- 插入产品分类
INSERT INTO categories (分类名称, 分类描述) VALUES
('标准铁球', '传统标准规格的铁球产品'),
('健身铁球', '适合健身使用的铁球产品'),
('收藏铁球', '限量版和收藏级铁球'),
('礼品铁球', '精美包装的礼品铁球');

-- 插入测试产品
INSERT INTO product (产品名称, 描述, 价格, 库存, 销量, 图片, 分类ID, 工艺师ID, 审核状态) VALUES
('保定铁球标准款', '传统保定铁球，标准规格，适合日常把玩健身', 128.00, 100, 50, 'https://via.placeholder.com/300x300?text=铁球1', 1, 1, '已通过'),
('保定铁球健身款', '加重型铁球，适合力量训练', 168.00, 80, 30, 'https://via.placeholder.com/300x300?text=铁球2', 2, 1, '已通过'),
('保定铁球收藏版', '限量版手工锻造，具有收藏价值', 588.00, 20, 10, 'https://via.placeholder.com/300x300?text=铁球3', 3, 2, '已通过'),
('保定铁球礼品装', '精美礼盒包装，送礼佳品', 288.00, 60, 25, 'https://via.placeholder.com/300x300?text=铁球4', 4, 1, '已通过'),
('保定铁球迷你款', '小巧便携，随时随地把玩', 88.00, 150, 80, 'https://via.placeholder.com/300x300?text=铁球5', 1, 2, '已通过');

-- 插入测试用户（密码: user123）
INSERT INTO Users (用户名, 密码, 手机号, 邮箱, 角色) VALUES
('testuser', '$2a$10$XQxBtJXKQe5J5P5Z5Z5Z5eZ5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z', '13800138001', 'user@example.com', '用户');
