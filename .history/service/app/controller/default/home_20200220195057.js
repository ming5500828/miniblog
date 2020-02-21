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
    // let result = await this.app.mysql.get("blog_content", {});
    // console.log(result);
    // this.ctx.body = result;
    let sql =
      "SELECT article.id as id," +
      "article.title as title," +
      "article.introduce as introduce," +
      "article.addTime as addTime," +
      "article.view_count as view_count ," +
      ".type.typeName as typeName " +
      "FROM article LEFT JOIN type ON article.type_id = type.Id";

    const results = await this.app.mysql.query(sql);

    this.ctx.body = {
      data: "ddfasfdsf"
    };
  }
}

module.exports = HomeController;
