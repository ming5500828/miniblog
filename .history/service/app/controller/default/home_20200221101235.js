"use strict";

const Controller = require("egg").Controller;

class HomeController extends Controller {
  async index() {
    //获取用户表的数据

    let result = await this.app.mysql.get("blog_content", {});
    console.log(result);
    this.ctx.body = result;
  }

  async getArticleList() {
    let sql =
      "SELECT article.id as id," +
      "article.title as title," +
      "article.introduce as introduce," +
      "FROM_UNIXTIME(article.addTime,'%Y-%m-%d' ) as addTime," +
      "article.view_count as view_count ," +
      "article.introduce_html as introduce_html ," +
      "type.typeName as typeName " +
      "FROM article LEFT JOIN type ON article.type_id = type.Id " +
      "WHERE article.isTop = 0  AND article.type_id <> 99 " +
      "ORDER BY article.id DESC";
    //console.log(sql)
    const resList = await this.app.mysql.query(sql);
    const resType = await this.app.mysql.select("type");
    //大胖逼逼叨列表
    const bibidaoList = await this.app.mysql.select("bibidao", {
      orders: [["id", "desc"]],
      limit: 4
    });
    //置顶文章
    let sql2 =
      "SELECT article.id as id," +
      "article.title as title," +
      "article.introduce as introduce," +
      "FROM_UNIXTIME(article.addTime,'%Y-%m-%d' ) as addTime," +
      "article.view_count as view_count ," +
      "article.introduce_html as introduce_html ," +
      "type.typeName as typeName " +
      "FROM article LEFT JOIN type ON article.type_id = type.Id " +
      "WHERE article.isTop = 1 " +
      "ORDER BY article.id DESC";
    const resTopList = await this.app.mysql.query(sql2);
    this.ctx.body = {
      list: resList,
      type: resType,
      bibidaoList: bibidaoList,
      topList: resTopList
    };
  }
}

module.exports = HomeController;
