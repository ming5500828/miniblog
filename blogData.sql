/*
 Navicat Premium Data Transfer

 Source Server         : blog
 Source Server Type    : MySQL
 Source Server Version : 50729
 Source Host           : localhost:3308
 Source Schema         : blogData

 Target Server Type    : MySQL
 Target Server Version : 50729
 File Encoding         : 65001

 Date: 21/02/2020 18:10:40
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for article
-- ----------------------------
DROP TABLE IF EXISTS `article`;
CREATE TABLE `article` (
  `id` int(255) DEFAULT NULL,
  `type_id` int(11) DEFAULT NULL,
  `title` varchar(255) COLLATE utf8mb4_bin DEFAULT NULL,
  `article_content` varchar(255) COLLATE utf8mb4_bin DEFAULT NULL,
  `introduce` varchar(255) COLLATE utf8mb4_bin DEFAULT NULL,
  `addTime` datetime DEFAULT NULL,
  `view_count` varchar(255) COLLATE utf8mb4_bin DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- ----------------------------
-- Records of article
-- ----------------------------
BEGIN;
INSERT INTO `article` VALUES (1, 1, '喂鹅', '喂而为', '喂而为人', '2020-02-21 10:11:42', '温度范围热');
INSERT INTO `article` VALUES (2, 2, '你好', '史蒂芬地方', '水电费水电费', '2020-02-19 16:04:41', '似懂非懂');
COMMIT;

-- ----------------------------
-- Table structure for blog_content
-- ----------------------------
DROP TABLE IF EXISTS `blog_content`;
CREATE TABLE `blog_content` (
  `title` varchar(255) COLLATE utf8mb4_bin DEFAULT NULL,
  `type` varchar(255) COLLATE utf8mb4_bin DEFAULT NULL,
  `introduce` varchar(255) COLLATE utf8mb4_bin DEFAULT NULL,
  `content` varchar(255) COLLATE utf8mb4_bin DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- ----------------------------
-- Records of blog_content
-- ----------------------------
BEGIN;
INSERT INTO `blog_content` VALUES ('123213', '123', '权威', '温热1111');
COMMIT;

-- ----------------------------
-- Table structure for type
-- ----------------------------
DROP TABLE IF EXISTS `type`;
CREATE TABLE `type` (
  `id` int(11) DEFAULT NULL,
  `typeName` varchar(255) COLLATE utf8mb4_bin DEFAULT NULL,
  `orderNum` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- ----------------------------
-- Records of type
-- ----------------------------
BEGIN;
INSERT INTO `type` VALUES (1, '我认为儿', 123);
INSERT INTO `type` VALUES (2, '史蒂夫', 456);
COMMIT;

SET FOREIGN_KEY_CHECKS = 1;
