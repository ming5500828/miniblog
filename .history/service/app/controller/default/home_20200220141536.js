"use strict";

const Controller = require("egg").Controller;

class HomeController extends Controller {
  async index() {
    //获取用户表的数据

    let result = await this.app.mysql.get("blog_content", {});
    console.log(result);
    this.ctx.body = result;
  }

  
因为我到目前一共只写了20多篇文章，所有也不需要什么分页的东西,这里也就不作分页设置了。

写完之后还需要配置一下路由（router），打开/app/router/default.js,新建立一个get形式的路由配置，代码如下：

module.exports = app =>{
    const {router,controller} = app
    router.get('/default/index',controller.default.home.index)
    router.get('/default/getArticleList',controller.default.home.getArticleList)
}
这个配置完成后，可以现在浏览器中预览一下结果，看看是否可以正确输出结果。访问地址：http://127.0.0.1:7001/default/getArticleList。如果能出现结果，说明我们已经完成了数据和接口的开发。

p17：前中台结合1-前台读取首页文章列表接口
现在数据库、表和接口我们都已经完成了，这集可以试着从数据接口获得数据，然后现在在页面上了。实现这个需求，我们将使用Axios模块来实现。


安装Axios模块
先进入前台的文件夹，如果你和我写的文件名是一样的，应该是blog，引入后就可以使用yarn命令进行安装了，当然你用npm来进行安装也是完全可以的。

yarn add axios
安装完成后可以到package.json里看一下现在安装的结果，我目前安装的0.19.0版本，你们学习的时候可以跟我的不太一样。

新建getInitialProps方法并获取数据
当Axios安装完成后，就可以从接口获取数据了。打开/blog/pages/index.js文件，在文件下方编写getInitialProps。

Home.getInitialProps = async ()=>{
  const promise = new Promise((resolve)=>{
    axios('http://127.0.0.1:7001/default/getArticleList').then(
      (res)=>{
        //console.log('远程获取数据结果:',res.data.data)
        resolve(res.data)
      }
    )
  })

  return await promise
}
这里使用了经典的async/await的异步方法。我们可以在得到数据后在控制台打印一下，查看一下结果。

把数据放入到界面中
当我们在getInitialProps方法里获得数据后，是可以直接传递到正式方法里，然后进行使用:

const Home = (list) =>{

  console.log(list)
  //---------主要代码-------------start
  const [ mylist , setMylist ] = useState( list.data);
  //---------主要代码-------------end
  return (
    <>
      <Head>
        <title>Home</title>
      </Head>
      <Header />
      <Row className="comm-main" type="flex" justify="center">
        <Col className="comm-left" xs={24} sm={24} md={16} lg={18} xl={14}  >
            <div>

              <List
                header={<div>最新日志</div>}
                itemLayout="vertical"
                dataSource={mylist}
                renderItem={item => (
                  <List.Item>

                    <div className="list-title">{item.title}</div>
                    <div className="list-icon">
                      <span><Icon type="calendar" /> {item.addTime}</span>
                      <span><Icon type="folder" /> {item.typeName}</span>
                      <span><Icon type="fire" /> {item.view_count}人</span>
                    </div>
                    <div className="list-context">{item.introduce}</div>  
                  </List.Item>
                )}
              />  

            </div>
        </Col>

        <Col className="comm-right" xs={0} sm={0} md={7} lg={5} xl={4}>
          <Author />
          <Advert />
        </Col>
      </Row>
      <Footer/>

   </>
  )

} 
做完这步，我们的内容就应该正确的显示在页面上了，但是还是有点小问题，比如我们的日期格式还是不正确。

修改时间戳为日期格式
其实这个有很多方法，有前端实现的方法，也有后端实现的方法，但是我觉的使用SQL语句来实现是最简单的一种方法。

打开/service/app/controller/home.js文件，找到拼凑SQL语句那部分代码，把代码修改成如下样式即可实现转换。

let sql = 'SELECT article.id as id,'+
                 'article.title as title,'+
                 'article.introduce as introduce,'+
                 //主要代码----------start
                 "FROM_UNIXTIME(article.addTime,'%Y-%m-%d %H:%i:%s' ) as addTime,"+
                 //主要代码----------end
                 'article.view_count as view_count ,'+
                 '.type.typeName as typeName '+
                 'FROM article LEFT JOIN type ON article.type_id = type.Id'
现在去浏览器中预览一下，应该就实现了时间戳转换成时间日期格式了。这节课我们就到这里，主要讲解了前台读取接口后如何显示在页面上的一些知识。

p18：前中台结合2-文章详细页面接口制作展示
首页的接口和展示已经差不多了，现在可以制作详细页的接口和内容。这节课主要目的是制作文章详细页面的接口，通过一个ID查找出详细的信息。


编写中台详细页面接口
先打开/service/app/controller/default/home.js文件，编写接口，代码如下。需要注意的是整个接口是需要接收文章ID，然后根据文章ID查出内容的。

home.js文件

    async getArticleById(){
        //先配置路由的动态传值，然后再接收值
        let id = this.ctx.params.id

        let sql = 'SELECT article.id as id,'+
        'article.title as title,'+
        'article.introduce as introduce,'+
        'article.article_content as article_content,'+
        "FROM_UNIXTIME(article.addTime,'%Y-%m-%d %H:%i:%s' ) as addTime,"+
        'article.view_count as view_count ,'+
        'type.typeName as typeName ,'+
        'type.id as typeId '+
        'FROM article LEFT JOIN type ON article.type_id = type.Id '+
        'WHERE article.id='+id



        const result = await this.app.mysql.query(sql)


        this.ctx.body={data:result}

    }
编写完成后，这个接口就可以使用了，但是不要忘记，开启MySql服务和中台接口服务。

编写前台链接导航
有了接口，先不着急编写详细页面，先把首页到详细页的链接做好。这个直接使用Next.js中的<Link>标签就可以了。找到首页中循环时文章的标题，在外边包括<Link>标签就可以了。

需要注意的是，这里

此段代码在/blog/pages/index.js

 <div className="list-title">
    <Link href={{pathname:'/detailed',query:{id:item.id}}}>
      <a>{item.title}</a>
    </Link>
  </div>
详细页从接口获取数据
当我们能通过链接跳转到详细页面之后，就可以编写detailed.js，通过getInitialProps来访问中台接口，并从中台接口获得数据。

detailed.js文件中的代码

Detailed.getInitialProps = async(context)=>{

  console.log(context.query.id)
  let id =context.query.id
  const promise = new Promise((resolve)=>{

    axios('http://127.0.0.1:7001/default/getArticleById/'+id).then(
      (res)=>{
        console.log(title)
        resolve(res.data.data[0])
      }
    )
  })

  return await promise
}
写完之后我们访问一下代码，看看是不是可以拿到后台的数据（后台数据你可以尽量多准备一些）。如果预览可以拿到数据，证明我们的编写是没有问题的。这节课就到这里，下节课我们将重构一下详细页面的UI，使用marked+highlight形式编写。

p19：解决egg.js的跨域问题
上节课的在最后预览时，我们遇到了跨域问题。这个是每个前后端分离的程序都会遇到的一个问题。这节课我们就一小点时间解决这个跨域问题。


安装egg-cors
egg-cors模块是专门用来解决egg.js跨域问题的，只要简单的配置就可以完成跨域的设置，但是跨域一定要谨慎设置，很多安全问题，都是通过跨域进行攻击的。

安装我们使用`yarn add``进行安装，命令如下：

yarn add egg-cors
安装时间根据自己的网络状况不同，有所不同。我用了大概10秒钟左右。

配置config/plugin.js文件
在安装完成后需要对/service/config/plugin.js文件进行修改，加入egg-cors模块即可。

exports.cors: {
    enable: true,
    package: 'egg-cors'
}
配置config.default.js
在配置完成plugin.js文件以后，还需要设置config.default.js文件。这个文件主要设置的是允许什么域名和请求方法可以进行跨域访问。配置代码如下。

　　config.security = {
　　　　csrf: {
　　　　　　enable: false
　　　　},
　　　　domainWhiteList: [ '*' ]
　　};
 config.cors = {
    origin: '*',
    allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH,OPTIONS'
};
如果你只想让http://localhost:3000来进行接口方案，就可以设置成下面的代码。

  config.security = {
　　　　csrf: {enable: false},
　　　　domainWhiteList: [ '*' ]
　　};
  config.cors = {
    origin: 'http://localhost:3000', //只允许这个域进行访问接口
    credentials: true,   // 开启认证
    allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH,OPTIONS'
    };
设置完成后，就可以在浏览器中进行预览了，如果能正常访问，说明跨域访问已经设置成功了。

p20：重构前台博客详细页面1-marked+highlight
以前我们在博客文章详细页使用了react-markdown,但是这个插件的配置项还是太少了(当时也是想尝尝鲜，所以没作过多的技术判断和调研,在这里跟小伙伴们道歉了！！！)所以我决定转回我目前项目中使用的一套方案marked+highlight.js。这个方案是比较成熟的，目前公司的开发文档程序就是基于这个开发的。


安装marked和highlight
这两个模块需要先安装，这里我们就使用yarn来进行安装。打开终端，进入到blog目录下，然后使用下面命令进行安装。

yarn add marked
yarn add highlight
这个可能需要的时间多一点，我目前的版本是marked是0.7.0,highlight是9.15.10。如果版本有变化，导致代码没法运行，可自行查看API进行修改。

重构detailed.js文件
这里的重构主要就是替换以前的Markdown解决方案。在代码顶部用import引入刚才安装的marked和highlight.js。

引入模块

import marked from 'marked'
import hljs from "highlight.js";
import 'highlight.js/styles/monokai-sublime.css';
引入设置一下marked.setOptions，里边的属性比较多，我在这里详细的介绍一下。

const renderer = new marked.Renderer();

marked.setOptions({
    renderer: renderer, 
    gfm: true,
    pedantic: false,
    sanitize: false,
    tables: true,
    breaks: false,
    smartLists: true,
    smartypants: false,
    highlight: function (code) {
            return hljs.highlightAuto(code).value;
    }
  }); 

    let html = marked(props.article_content) 

renderer: 这个是必须填写的，你可以通过自定义的Renderer渲染出自定义的格式

gfm：启动类似Github样式的Markdown,填写true或者false

pedatic：只解析符合Markdown定义的，不修正Markdown的错误。填写true或者false

sanitize: 原始输出，忽略HTML标签，这个作为一个开发人员，一定要写flase

tables： 支持Github形式的表格，必须打开gfm选项

breaks: 支持Github换行符，必须打开gfm选项，填写true或者false

smartLists：优化列表输出，这个填写ture之后，你的样式会好看很多，所以建议设置成ture

highlight: 高亮显示规则 ，这里我们将使用highlight.js来完成

** 增加Code的高亮显示 **

在设置setOptions属性时，可以直接设置高亮显示，代码如下：

highlight: function (code) {
            return hljs.highlightAuto(code).value;
    }
设置完成后，你在浏览器检查代码时就可以出现hljs的样式，说明你的效果加成功了，实现了高亮显示代码。

CSS样式的更换
都设置好以后，是不是又觉的现在样式也不是很好看，所以可以继续设置一下CSS样式。因为我们的视频中不讲解CSS样式部分，但是我给你提供了我detailed.css所有代码

.bread-div{
    padding: .5rem;
    border-bottom:1px solid #eee;
    background-color: #e1f0ff;
}
.detailed-title{
    font-size: 1.8rem;
    text-align: center;
    padding: 1rem;
}
.center{
    text-align: center;
}
.detailed-content{
    padding: 1.3rem;
    font-size: 1rem;
}
pre{
    display: block;
    background-color:#f3f3f3;
     padding: .5rem !important;
     overflow-y: auto;
     font-weight: 300;
     font-family: Menlo, monospace;
     border-radius: .3rem;
}
pre{
    background-color: #283646 !important;
}
pre >code{
    border:0px !important;
    background-color: #283646 !important;
    color:#FFF;

}
code {
    display: inline-block ;
    background-color:#f3f3f3;
    border:1px solid #fdb9cc;
    border-radius:3px;
    font-size: 12px;
    padding-left: 5px;
    padding-right: 5px;
    color:#4f4f4f;
    margin: 0px 3px;

}

.title-anchor{
    color:#888 !important;
    padding:4px !important;
    margin: 0rem !important;
    height: auto !important;
    line-height: 1.2rem !important;
    font-size: .7rem !important;
    border-bottom: 1px dashed #eee;
    overflow: hidden;
    text-overflow:ellipsis;
    white-space: nowrap;
}
.active{
    color:rgb(30, 144, 255) !important;
}
.nav-title{
    text-align: center;
    color: #888;
    border-bottom: 1px solid rgb(30, 144, 255);

}
.article-menu{
    font-size:12px;
}
iframe{
    height: 34rem;
}
.detailed-content  img{
    width: 100%;
    border:1px solid #f3f3f3;
}
.title-level3{
    display: none !important;
}
.ant-anchor-link-title{
    font-size: 12px !important;
}
.ant-anchor-wrapper{
    padding: 5px !important;
}


样式复制完，我们再到浏览器中预览一下，应该就可以出现更漂亮的效果了。这节课就到这里，下节课我们把右侧的导航也重新完善一下，实现对文章章节的导航效果。学习是一定要跟着作，如果不作你也许什么都学不会。

p21：重构前台博客详细页面2-实现文章导航
重构后前台详细页的文章导航部分出现了错误提示，这个主要是我们选择的markdown-navbar模块的坑，所以我也决定重新使用公司用的方案，这个插件是我同事写的，而且比较好用，为了尊重版权所有就不自己编写了，而是直接使用。


tocify.tsx文件简介
同事写的是一个tocify.tsx文件，用这个扩展名的含义是他使用了typeScript语法来编写jsx的部分，为了更好的和普通的是jsx文件区分，所以这里使用了tsx的扩展名。我们不需要对这个文件了解太多，只要会用就可以了，我同事正想把他开源出去，我在这里也算给他作一个小宣传了。

使用这个文件的两个必要条件

你的程序员中使用了Ant DesignUI库，因为它里边的导航部分，使用了antd的Anchor组件

安装lodash模块，这个可以直接使用yarn add lodash来安装

上面两个条件满足后，你可以把文件tocify.tsx拷贝到你的项目里了，我这里放到了/blog/components文件夹下了，把它视为一种自定义组件。

tocify.tsx文件

import React from 'react';
import { Anchor } from 'antd';
import { last } from 'lodash';

const { Link } = Anchor;

export interface TocItem {
  anchor: string;
  level: number;
  text: string;
  children?: TocItem[];
}

export type TocItems = TocItem[]; // TOC目录树结构

export default class Tocify {
  tocItems: TocItems = [];

  index: number = 0;

  constructor() {
    this.tocItems = [];
    this.index = 0;
  }

  add(text: string, level: number) {
    const anchor = `toc${level}${++this.index}`;
    const item = { anchor, level, text };
    const items = this.tocItems;

    if (items.length === 0) { // 第一个 item 直接 push
      items.push(item);
    } else {
      let lastItem = last(items) as TocItem; // 最后一个 item

      if (item.level > lastItem.level) { // item 是 lastItem 的 children
        for (let i = lastItem.level + 1; i <= 2; i++) {
          const { children } = lastItem;
          if (!children) { // 如果 children 不存在
            lastItem.children = [item];
            break;
          }

          lastItem = last(children) as TocItem; // 重置 lastItem 为 children 的最后一个 item

          if (item.level <= lastItem.level) { // item level 小于或等于 lastItem level 都视为与 children 同级
            children.push(item);
            break;
          }
        }
      } else { // 置于最顶级
        items.push(item);
      }
    }

    return anchor;
  }

  reset = () => {
    this.tocItems = [];
    this.index = 0;
  };

  renderToc(items: TocItem[]) { // 递归 render
    return items.map(item => (
      <Link key={item.anchor} href={`#${item.anchor}`} title={item.text}>
        {item.children && this.renderToc(item.children)}
      </Link>
    ));
  }

  render() {
    return (
      <Anchor affix showInkInFixed>
         {this.renderToc(this.tocItems)}
      </Anchor>
    );
  }
}
其实这个文件也很简单，如果JavaScript基础没问题是完全可以看明白的。

使用tocify.tsx生成文章目录
接下来就可以利用tocify.tsx文件生成目录了，在/blog/pages/detailed.js引入。

import Tocify from '../components/tocify.tsx'
引入后，需要对marked的渲染进行自定义，这时候需要设置renderer.heading，就是写一个方法们重新定义对#这种标签的解析。代码如下：

const tocify = new Tocify()
renderer.heading = function(text, level, raw) {
      const anchor = tocify.add(text, level);
      return `<a id="${anchor}" href="#${anchor}" class="anchor-fix"><h${level}>${text}</h${level}></a>\n`;
    };
最后在需要显示文章导航的地方，写下面的代码:

<div className="toc-list">
  {tocify && tocify.render()}
</div>
这里为了你方便学习，给出detailed.js全部代码。

import React,{useState} from 'react'
import Head from 'next/head'
import {Row, Col ,Affix, Icon ,Breadcrumb  } from 'antd'

import Header from '../components/Header'
import Author from '../components/Author'
import Advert from '../components/Advert'
import Footer from '../components/Footer'
import '../static/style/pages/detailed.css'
import MarkNav from 'markdown-navbar';
import 'markdown-navbar/dist/navbar.css';
import axios from 'axios'
import marked from 'marked'
import hljs from "highlight.js";
import 'highlight.js/styles/monokai-sublime.css';
import Tocify from '../components/tocify.tsx'




const Detailed = (props) =>{

  let articleContent=props.article_content

  const tocify = new Tocify()
  const renderer = new marked.Renderer();
    renderer.heading = function(text, level, raw) {
      const anchor = tocify.add(text, level);
      return `<a id="${anchor}" href="#${anchor}" class="anchor-fix"><h${level}>${text}</h${level}></a>\n`;
    };

  marked.setOptions({

    renderer: renderer,

    gfm: true,
    pedantic: false,
    sanitize: false,
    tables: true,
    breaks: false,
    smartLists: true,
    smartypants: false,

    highlight: function (code) {
            return hljs.highlightAuto(code).value;
    }

  }); 



    let html = marked(props.article_content) 




  return (
    <>
      <Head>
        <title>博客详细页</title>
      </Head>
      <Header />
      <Row className="comm-main" type="flex" justify="center">
        <Col className="comm-left" xs={24} sm={24} md={16} lg={18} xl={14}  >
            <div>
              <div className="bread-div">
                <Breadcrumb>
                  <Breadcrumb.Item><a href="/">首页</a></Breadcrumb.Item>
                  <Breadcrumb.Item>{props.typeName}</Breadcrumb.Item>
                  <Breadcrumb.Item> {props.title}</Breadcrumb.Item>
                </Breadcrumb>
              </div>

             <div>
                <div className="detailed-title">
                {props.title}
                </div>

                <div className="list-icon center">
                  <span><Icon type="calendar" /> {props.addTime}</span>
                  <span><Icon type="folder" /> {props.typeName}</span>
                  <span><Icon type="fire" /> {props.view_count}</span>
                </div>

                <div className="detailed-content"  
                  dangerouslySetInnerHTML = {{__html:html}}   >


                </div>

             </div>

            </div>
        </Col>

        <Col className="comm-right" xs={0} sm={0} md={7} lg={5} xl={4}>
          <Author />
          <Advert />
          <Affix offsetTop={5}>
            <div className="detailed-nav comm-box">
              <div className="nav-title">文章目录</div>
              <div className="toc-list">
                {tocify && tocify.render()}
              </div>

            </div>
          </Affix>

        </Col>
      </Row>
      <Footer/>

   </>
  )

} 

Detailed.getInitialProps = async(context)=>{

  console.log(context.query.id)
  let id =context.query.id
  const promise = new Promise((resolve)=>{

    axios('http://127.0.0.1:7001/default/getArticleById/'+id).then(
      (res)=>{
        // console.log(title)
        resolve(res.data.data[0])
      }
    )
  })

  return await promise
}

export default Detailed
这样就完成了前端详细文章页面的文章导航，可以预览一下效果。

p22：前台文章列表页的制作1-接口模块化和读取文章分类
从这节课开始，要制作一下文章列表页的前中台结合。由于接口越来越多，现在这样零散的管理非常不利于日后的维护，所以需要单独一个文件，专门用于前台和中台的接口管理。这样在以后部署和更换服务器时都非常简单。


编写统一中台API配置文件
在blog的根目录下，新建一个config文件夹，然后再文件夹下简历一个apiUrl.js文件，写入下面的代码。

let ipUrl = 'http://127.0.0.1:7001/default/' 

let servicePath = {
    getArticleList:ipUrl + 'getArticleList' ,  //  首页文章列表接口
    getArticleById:ipUrl + 'getArticleById/',  // 文章详细页内容接口 ,需要接收参数

}
export default servicePath;

完成后，可以去pages/index.js文件中，修改以前的接口路由，在修改前，需要先进行引入。

import  servicePath  from '../config/apiUrl'
引入后，直接进行更换

Home.getInitialProps = async ()=>{
  const promise = new Promise((resolve)=>{
    axios(servicePath.getArticleList).then(
      (res)=>{
        resolve(res.data)
      }
    )
  })

  return await promise
}
首页更换完成，再去pages/detailed.js（详细页）文件中进行更换。

//先进行引入
import  servicePath  from '../config/apiUrl'

//引入后进行修改
Detailed.getInitialProps = async(context)=>{

  console.log(context.query.id)
  let id =context.query.id
  const promise = new Promise((resolve)=>{

    axios(servicePath.getArticleById+id).then(
      (res)=>{
        // console.log(title)
        resolve(res.data.data[0])
      }
    )
  })

  return await promise
}
这样我们就形成了一个统一的接口管理文件，以后在维护上会方便很多。

修改首页接口 读取文章类别信息
我们希望每个页面只读取一次接口，然后服务端渲染好后展示给我们，这时候就需要在首页的getArticleList接口中进行修改了。

文件位置/service/app/default/home.js

修改的代码如下:


  //得到类别名称和编号
  async getTypeInfo(){

      const result = await this.app.mysql.select('type')
      this.ctx.body = {data:result}

  }
接口编写完成，就可以在<Header/>组件中使用了。

修改数据库
因为我们设计的是有Icon的，但是这个数据缺少一个图标选项，现在把图标也存入数据库中。

我们打开mysql的管理，然后在里边加入icon字段。

视频教程加上youtube
大胖逼逼叨加上message
快乐生活加上smile
这时候我们就有了图标字段并且有了值，再次修改<Header>组件的代码，加入图标的部分，并且把博客首页也加上去。

修改Header组件
以前我们的Header组件是静态的，也就是写死的，现在我们需要利用useEffect()方法来从接口中获取动态数据。

需要先引入useState和useEffect,然后由于还要进行跳转，所以还要引入Router和Link,由于还要访问接口，所以还要引入axios和servicePath.

import React ,{useState,useEffect} from 'react'
import Router from 'next/router'
import Link from 'next/link'
import axios from 'axios'
import  servicePath  from '../config/apiUrl'
引入后用useState声明navArray和使用useEffect()获取远程数据


    const [navArray , setNavArray] = useState([])
    useEffect(()=>{

        const fetchData = async ()=>{
           const result= await axios(servicePath.getTypeInfo).then(
                (res)=>{
                    setNavArray(res.data.data)
                    return res.data.data
                }
              )
           setNavArray(result)
        }
        fetchData()


    },[])
useEffect()写完后，可以获得博客的分类信息了，要想让分类信息可以跳转，可以写一个方法handleClick。


//跳转到列表页
  const handleClick = (e)=>{
      if(e.key==0){
          Router.push('/index')
      }else{
          Router.push('/list?id='+e.key)
      }


  }
这些都准备好以后，就可以写我们的JSX语法，修改<Menu>组件部分了，代码如下：

  <Col className="memu-div" xs={0} sm={0} md={14} lg={10} xl={7}>
      <Menu  
        mode="horizontal"
        onClick={handleClick}
      >
          <Menu.Item key="0">
              <Icon type="home" />
              博客首页
          </Menu.Item>
          {
              navArray.map((item)=>{
              return(
                  <Menu.Item key={item.Id}>
                      <Icon type={item.icon} />
                      {item.typeName}
                  </Menu.Item>
              )
              }) 
          }
      </Menu>
  </Col>
为了方便你学习，我这里给出全部的Header.js代码。

import React ,{useState,useEffect} from 'react'
import Router from 'next/router'
import Link from 'next/link'
import '../static/style/components/header.css'
import {Row,Col, Menu, Icon} from 'antd'
import axios from 'axios'
import  servicePath  from '../config/apiUrl'

const Header = () => {


    const [navArray , setNavArray] = useState([])
    useEffect(()=>{

        const fetchData = async ()=>{
           const result= await axios(servicePath.getTypeInfo).then(
                (res)=>{
                    setNavArray(res.data.data)
                    return res.data.data
                }
              )
           setNavArray(result)
        }
        fetchData()


    },[])
    //跳转到列表页
    const handleClick = (e)=>{
        if(e.key==0){
            Router.push('/index')
        }else{
            Router.push('/list?id='+e.key)
        }


    }

    return (
        <div className="header">
            <Row type="flex" justify="center">
                <Col  xs={24} sm={24} md={10} lg={13} xl={11}>
                    <span className="header-logo">
                        <Link href={{pathname:'/index'}}>
                            <a> 技术胖</a>
                        </Link>

                    </span>
                    <span className="header-txt">专注前端开发,每年100集免费视频。</span>
                </Col>

                <Col className="memu-div" xs={0} sm={0} md={14} lg={10} xl={7}>
                    <Menu  
                      mode="horizontal"
                      onClick={handleClick}
                    >
                        <Menu.Item key="0">
                            <Icon type="home" />
                            博客首页
                        </Menu.Item>
                        {
                           navArray.map((item)=>{
                            return(
                                <Menu.Item key={item.Id}>
                                    <Icon type={item.icon} />
                                    {item.typeName}
                                </Menu.Item>
                            )
                           }) 
                        }
                    </Menu>
                </Col>
            </Row>
        </div>
    )
}

export default Header
这时候就在首页读取到了类别信息，可以到浏览器中预览一下了。如果出现了想要的界面，说明我们已经制作成功了。

p23：前台文章列表页的制作2-根据类别读取文章列表
现在已经可以进入到文章列表页，但是列表页的内容现在还是静态的。我们的意愿是根据文章类别来展现不同的内容，比如视频列表就全部都是视频，大胖逼逼叨就全是我的唠嗑内容。要实现这个效果，我们还是需要制作一个接口的。


编写根据类别ID获取文章列表接口
打开/service/app/default/home.js,编写对应的接口，因为这里需要转换时间，所以只能使用query这种形式。


//根据类别ID获得文章列表
async getListById(){
    let id = this.ctx.params.id
    let sql = 'SELECT article.id as id,'+
    'article.title as title,'+
    'article.introduce as introduce,'+
    "FROM_UNIXTIME(article.addTime,'%Y-%m-%d %H:%i:%s' ) as addTime,"+
    'article.view_count as view_count ,'+
    'type.typeName as typeName '+
    'FROM article LEFT JOIN type ON article.type_id = type.Id '+
    'WHERE type_id='+id
    const result = await this.app.mysql.query(sql)
    this.ctx.body={data:result}

}
路由和接口管理文件
有了接口后，需要中台为其配置路由，才能让前台可以访问到。

打开/service/router/default.js文件，然后在下方增加代码。

 router.get('/default/getListById',controller.default.home.getListById)
这样就配置好了路由，接下里去前台的接口管理文件/config/apiUrl.js

let ipUrl = 'http://127.0.0.1:7001/default/' 

let servicePath = {
    getArticleList:ipUrl + 'getArticleList' ,  //  首页文章列表接口
    getArticleById:ipUrl + 'getArticleById/',  // 文章详细页内容接口 ,需要接收参数
    getTypeInfo:ipUrl + 'getTypeInfo',         // 文章分类信息
    getListById:ipUrl + 'getListById',         // 根据类别ID获得文章列表  
}
export default servicePath;
这样就可以在前台使用路径访问到中台提供的数据了。

编写前台UI界面
因为要进行Axios请求，所以需要用import进行引入。

import React,{useState,useEffect} from 'react'
import axios from 'axios'
import  servicePath  from '../config/apiUrl'
import Link from 'next/link'
引入完成后，可以直接使用getInitialProps从接口中获取数据，代码如下。


ArticleList.getInitialProps = async (context)=>{

  let id =context.query.id
  const promise = new Promise((resolve)=>{
    axios(servicePath.getListById+id).then(
      (res)=>resolve(res.data)
    )
  })
  return await promise
}
当getInitialProps写完后，就可以编写JSX部分了，这里主要是循环部分<List>组件的代码。


 const [ mylist , setMylist ] = useState(list.data);

 <List
    itemLayout="vertical"
    dataSource={mylist}
    renderItem={item => (
      <List.Item>
        <div className="list-title">
            <Link href={{pathname:'/detailed',query:{id:item.id}}}>
            <a>{item.title}</a>
          </Link>
        </div>
        <div className="list-icon">
          <span><Icon type="calendar" />{item.addTime}</span>
          <span><Icon type="folder" /> {item.typeName}</span>
          <span><Icon type="fire" />  {item.view_count}人</span>
        </div>
        <div className="list-context">{item.introduce}</div>  
      </List.Item>
    )}
  />  
编写完成后，去浏览器预览，发现这时候切换类别不变，因为我们没必要每个列别都去服务器重新请求，而是通过中台得到数据，就可以实现变化。如果你像每次重新请求也很简单，只要使用<Link>标签就可以了。

如果是不请求，直接写一个useEffect就可以解决不刷新的问题。

useEffect(()=>{
  setMylist(list.data)
 })
现在一切就都正常了，可以到浏览器中访问一下。可以实现类别的切换和跳转了。这节课二就先到这里，下节课接续制作。

p24：让前台所有页面支持Markdown解析
目前我们对博客文章的主要功能已经开发完了，并且你也可以看到文章详细页面也支持了Markdown的解析，但是现在我还希望在首页和列表页都可以支持Markdown的解析，这样就可以实现简介也使用Markdown格式来进行编写了。还可以加入图片。这节课就来完善一下首页和列表页Markdown的解析。

首页对Markdown语法的解析
打开/blog/pages/index.js文件，然后在文件顶部先引入下面的模块。

import marked from 'marked'
import hljs from "highlight.js";
import 'highlight.js/styles/monokai-sublime.css';
这些都是解析Markdown必须的模块和CSS样式。

之后可以对marked进行setOptions设置，代码如下：

  const renderer = new marked.Renderer();
  marked.setOptions({
    renderer: renderer,
    gfm: true,
    pedantic: false,
    sanitize: false,
    tables: true,
    breaks: false,
    smartLists: true,
    smartypants: false,
    sanitize:false,
    xhtml: false,
    highlight: function (code) {
            return hljs.highlightAuto(code).value;
    }

  }); 
设置完成后，在JSX部分的<List>组件中进行修改，主要修改的代码如下。

<div className="list-context"
      dangerouslySetInnerHTML={{__html:marked(item.introduce)}}
>
最后需要找到index.js对应的CSS样式文件，增加markdown的解析样式/static/pages/index.css。把下面这段CSS样式拷贝过去就剋了。

pre{
    display: block;
    background-color: #283646 !important;
     padding: .5rem !important;
     overflow-y: auto;
     font-weight: 300;
     font-family: Menlo, monospace;
     border-radius: .3rem;
}

pre >code{
    border:0px !important;
    background-color: #283646 !important;
    color:#FFF;

}
code {
    display: inline-block ;
    background-color:#f3f3f3;
    border:1px solid #fdb9cc;
    border-radius:3px;
    font-size: 12px;
    padding-left: 5px;
    padding-right: 5px;
    color:#4f4f4f;
    margin: 0px 3px;

}

.list-context img{
   width:100% ;
   border-radius:5px;
   border:1px solid #f0f0f0;
   max-width:1000px !important;
   display: block;
   margin:8px  auto ;

}


然后到浏览器中看一下效果，应该就可以对Markdown的格式作了一些解析。我相信小伙伴现在自己可以修改列表页的markdown解析了，自己动手实验一下。

p25：后台开发01-开发环境搭建
前台的主要功能我们已经开发完成了，接下来我们开始制作后台博客的管理界面。后台将采用React Hooks + Ant Design,我们主要会对博客文章的管理和登录系统进行讲解。本节课主要是搭建后端开发环境。


用脚手架生成项目
进入项目目录，然后直接使用create-react-app 生成目录，记得生成的目录要全部小写。

create-react-app admin
这个过程要根据你的网络情况，我公司的时间大概30秒，家里大概15分钟，我也不知道为什么，只能说是网络差异吧。建立好以后，我会把项目进行最小化设置（删除/src下的大部分代码和文件）.

只留下/src/index.js文件，然后把里边的代码删减成下面的样子。

import React from 'react';
import ReactDOM from 'react-dom';

ReactDOM.render(<App />, document.getElementById('root'));
这时候项目就是引入完成了。

安装和引入Ant Design
进入/admin文件夹，然后用yarn进行安装。

yarn add antd
也可以使用npm来进行安装。

npm install antd --save
安装完成后，可以在要使用的组件中进行引入代码如下。

import { Button } from 'antd';
import 'antd/dist/antd.css';
然后编写一个代码,如果能正常展示，说明我们完成了设置。

import React from 'react';
import 'antd/dist/antd.css';
import { Button } from 'antd';
function Login(){
    return (
        <div>
            <Button type="primary">Hello World</Button>
        </div>
    )
}
export default Login
这时候我们到浏览器中，预览一下结果，如果能成功出现按钮，说明我们的搭建成功了。下一集我们来配置后台的路由。

p26：后台开发02-页面路由配置
开发环境搭建好以后，接下来就可以设置路由了。路由的设置相当简单，所以这节课的时间也不会太长。（如果你还不熟悉React-router相关知识，可以到我的博客中看一下Router基础9节课）


安装 react-router-dom
进入admin文件夹，在文件夹下，直接使用yarn或者npm来进行安装。我这里就使用yarn来进行安装了。

yarn add react-router-dom
安装完成后可以到package.json中查看一下版本，我的版本是5.1.2，你学的时候可能版本有所变化。

使用Router
安装完成后，可以进行使用了。我们这里新建立一个Pages文件夹，并在Pages中建立一个Main.js文件，这个文件就是配置路由的，代码如下：


import React from 'react';
import { BrowserRouter as Router, Route} from "react-router-dom";
import Login from './Login'
function Main(){
    return (
        <Router>      
            <Route path="/login/" exact component={Login} />
        </Router>
    )
}
export default Main

然后再建立一个最简单的Login页面（这个页面下节课要详细制作），这节课能实现路由可以使用就可以。

import React , {useState} from 'react';
function Login(){
    return (
        <div>
           我是登录页面 
        </div>
    )
}
export default Login
这部完成后就可以到浏览器中看一下是否可以访问到登录页面了吗？如果可以访问，说明路由已经起作用了，下节课就可以开始制作登录页面了。

p27：后台管理系统开发03-编写登录界面
现在可以编写界面了，我们第一个界面就是登录，因为后台管理的一切都要求我们登录后才可以操作。如果没登录会跳转到登录。


引入需要使用的组件
进入Login.js文件后，先要引入一些需要的组件，这也算是你对这个编写文件最初的思考。这里我们需要引入React、antd。

import React , {useState} from 'react';
import 'antd/dist/antd.css';
import { Card, Input, Icon,Button ,Spin } from 'antd';
这样就引入好了，引入完成后，就可以编写UI部分了。

编写UI部分
引入后我们就可以编写UI样式，需要注意的是这里的className你需要跟我一样，否则你的CSS样式会不起作用。

再编写之前可以使用React Hooks特性里的useState来定义一些变量和改变变量的方法。

const [userName , setUserName] = useState('')
const [password , setPassword] = useState('')
const [isLoading, setIsLoading] = useState(false)
isLoading主要用于控制Spin组件是否进入加载状态，进入加载状态可以有效防止重复提交。

return (
        <div className="login-div">

            <Spin tip="Loading..." spinning={isLoading}>
                <Card title="JSPang Blog  System" bordered={true} style={{ width: 400 }} >
                    <Input
                        id="userName"
                        size="large"
                        placeholder="Enter your userName"
                        prefix={<Icon type="user" style={{color:'rgba(0,0,0,.25)'}} />}
                        onChange={(e)=>{setUserName(e.target.value)}}
                    /> 
                    <br/><br/>
                    <Input.Password
                        id="password"
                        size="large"
                        placeholder="Enter your password"
                        prefix={<Icon type="key" style={{color:'rgba(0,0,0,.25)'}} />}
                        onChange={(e)=>{setPassword(e.target.value)}}
                    />     
                    <br/><br/>
                    <Button type="primary" size="large" block onClick={checkLogin} > Login in </Button>
                </Card>
            </Spin>
        </div>
    )
UI写好了，需要编写一个checkLogin的方法，以后可以实现去后台验证的判断，这里我们只做一个UI状态的变化操作。剩下的操作以后再进行操作。

   const checkLogin = ()=>{
        setIsLoading(true)
        setTimeout(()=>{
            setIsLoading(false)
        },1000)
    }
编写CSS文件
到目前位置，我们还没有CSS样式，可以在/src目录下建立一个static的目录,当然名字你也可以完全自己取。然后在/static目录下再建立一个css目录，然后创建Login.css文件


.login-div{
    margin: 150px auto;
    width: 400px;
}
body{
    background-color: #f0f0f0;
}
因为我们这里多用的是Ant Desgin的组件，所以CSS样式非常好。写好后需要在Login.js中用import引入。

import '../static/css/Login.css';
到这里可以去浏览器中预览一下效果，再根据效果进行微调，调成自己喜欢的样子就可以了。这节课就先到这里，下节课我们继续学习。

p28：后台开发04-UI框架搭建
登录页面的UI制作完成了，当登录成功后，我们会跳转到博客的后台管理页面，这个页面依然是用Ant Desgin制作的。这里直接用官方提供的案例来作。


Layout布局
antd提供了协助进行页面级整体布局组件<Layout>。在这个组件的API文档里提供了很多已经写好的案例，既然已经写好了，就直接复制就可以了。

API地址：https://ant.design/components/layout-cn/

我们这里选左右布局的页面，你也可以自己灵活选择自己喜欢的，复制代码。

import { Layout, Menu, Breadcrumb, Icon } from 'antd';

const { Header, Content, Footer, Sider } = Layout;
const { SubMenu } = Menu;

class SiderDemo extends React.Component {
  state = {
    collapsed: false,
  };

  onCollapse = collapsed => {
    console.log(collapsed);
    this.setState({ collapsed });
  };

  render() {
    return (
      <Layout style={{ minHeight: '100vh' }}>
        <Sider collapsible collapsed={this.state.collapsed} onCollapse={this.onCollapse}>
          <div className="logo" />
          <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline">
            <Menu.Item key="1">
              <Icon type="pie-chart" />
              <span>Option 1</span>
            </Menu.Item>
            <Menu.Item key="2">
              <Icon type="desktop" />
              <span>Option 2</span>
            </Menu.Item>
            <SubMenu
              key="sub1"
              title={
                <span>
                  <Icon type="user" />
                  <span>User</span>
                </span>
              }
            >
              <Menu.Item key="3">Tom</Menu.Item>
              <Menu.Item key="4">Bill</Menu.Item>
              <Menu.Item key="5">Alex</Menu.Item>
            </SubMenu>
            <SubMenu
              key="sub2"
              title={
                <span>
                  <Icon type="team" />
                  <span>Team</span>
                </span>
              }
            >
              <Menu.Item key="6">Team 1</Menu.Item>
              <Menu.Item key="8">Team 2</Menu.Item>
            </SubMenu>
            <Menu.Item key="9">
              <Icon type="file" />
              <span>File</span>
            </Menu.Item>
          </Menu>
        </Sider>
        <Layout>
          <Header style={{ background: '#fff', padding: 0 }} />
          <Content style={{ margin: '0 16px' }}>
            <Breadcrumb style={{ margin: '16px 0' }}>
              <Breadcrumb.Item>User</Breadcrumb.Item>
              <Breadcrumb.Item>Bill</Breadcrumb.Item>
            </Breadcrumb>
            <div style={{ padding: 24, background: '#fff', minHeight: 360 }}>Bill is a cat.</div>
          </Content>
          <Footer style={{ textAlign: 'center' }}>Ant Design ©2018 Created by Ant UED</Footer>
        </Layout>
      </Layout>
    );
  }
}

ReactDOM.render(<SiderDemo />, mountNode);
这步完成后，还需要在/src/static/css文件夹下建立一个AdminIndex.css文件，复制下面的代码。

.logo {
    height: 32px;
    background: rgba(255, 255, 255, 0.2);
    margin: 16px;
  }
把Class形式改为Hooks形式
我们复制的代码是Class形式的，现在需要改成React Hooks形式的，也就是function组件。这里给出全部修改后的代码。

import React,{useState} from 'react';
import { Layout, Menu, Breadcrumb, Icon } from 'antd';
import '../static/css/AdminIndex.css'

const { Header, Content, Footer, Sider } = Layout;
const { SubMenu } = Menu;


function AdminIndex(){

  const [collapsed,setCollapsed] = useState(false)

  const onCollapse = collapsed => {
    setCollapsed(collapsed)
  };

    return (
      <Layout style={{ minHeight: '100vh' }}>
        <Sider  collapsible collapsed={collapsed} onCollapse={onCollapse}>
          <div className="logo" />
          <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline">
            <Menu.Item key="1">
              <Icon type="pie-chart" />
              <span>工作台</span>
            </Menu.Item>
            <Menu.Item key="2">
              <Icon type="desktop" />
              <span>添加文章</span>
            </Menu.Item>
            <SubMenu
              key="sub1"
              title={
                <span>
                  <Icon type="user" />
                  <span>文章管理</span>
                </span>
              }
            >
              <Menu.Item key="3">添加文章</Menu.Item>
              <Menu.Item key="4">文章列表</Menu.Item>

            </SubMenu>

            <Menu.Item key="9">
              <Icon type="file" />
              <span>留言管理</span>
            </Menu.Item>
          </Menu>
        </Sider>
        <Layout>
          <Header style={{ background: '#fff', padding: 0 }} />
          <Content style={{ margin: '0 16px' }}>
            <Breadcrumb style={{ margin: '16px 0' }}>
              <Breadcrumb.Item>后台管理</Breadcrumb.Item>
              <Breadcrumb.Item>工作台</Breadcrumb.Item>
            </Breadcrumb>
            <div style={{ padding: 24, background: '#fff', minHeight: 360 }}>博客工作台.</div>
          </Content>
          <Footer style={{ textAlign: 'center' }}>JSPang.com</Footer>
        </Layout>
      </Layout>
    )

}

export default AdminIndex
这步完成后，你还要去Main.js里去配置一下路由，然后就可以访问到这个页面了。

import React from 'react';
import { BrowserRouter as Router, Route} from "react-router-dom";
import Login from './Login'
import AdminIndex from './AdminIndex'
function Main(){
    return (
        <Router>      
            <Route path="/login/" exact component={Login} />
            <Route path="/index/" exact component={AdminIndex} />
        </Router>
    )
}
export default Main
路由配置完成后就可以，就可以通过浏览器进行预览，有不合适的地方可以自行微调一下。

p29：后台开发05-添加文章页面制作1
大体的UI架构确定下来以后，就可以制作里边的业务逻辑页面了，第一个要作的页面是添加博客文章，这是本套视频最难的一部分，所以要分成几节课来讲。这节课我们先做出标题和内容部分。


我们要制作的增加文章页面图片。

react-markdown

创建增加文章页面
在/src/pages目录下面，新建一个AddArticle.js的文件。建立完成后用import引入下面需要使用的组件

import React,{useState} from 'react';
import marked from 'marked'
import '../static/css/AddArticle.css'
import { Row, Col ,Input, Select ,Button ,DatePicker } from 'antd'

const { Option } = Select;
const { TextArea } = Input
可以看到这里我们有一个AddArticle.css文件是不存在的，这个是样式文件，我们可以在/src/static/css文件夹下建立AddArticle.css文件，然后把下面的CSS样式拷贝进去。（本视频不讲解CSS样式代码）

.markdown-content{
    font-size:16px !important;
    max-height: 745px;
}
.show-html{
    padding:10px;
    border:1px solid #ddd;
    border-radius: 5px;
    font-size:16px;
    height: 745px;
    background-color: #f0f0f0;
    overflow: auto;
}

.show-html h1{
    font-size:30px;
}

.show-html h2{
    font-size:28px;
    border-bottom: 1px solid #cbcbcb;
}
.show-html h3{
    font-size:24px;
}

.show-html pre{
    display: block;
    background-color: #f0f0f0;
    padding: 5px;
    border-radius: 5px;
}
.show-html pre>code{
    color: #000;
    background-color: #f0f0f0;
}
.show-html code {
    background-color: #fff5f5;
    padding: 5px 10px;
    border-radius: 5px;
    margin: 0px 3px; 
    color: #ff502c; 
}
.show-html blockquote{
    border-left:4px solid #cbcbcb ;
    padding: 10px 10px 10px 30px; 
    background-color: #f8f8f8;
}
.introduce-html{
    padding:10px;
    border:1px solid #ddd;
    border-radius: 5px;
    font-size:16px;

    background-color: #f0f0f0;
}


.introduce-html h1{
    font-size:30px;
}

.introduce-html h2{
    font-size:28px;
    border-bottom: 1px solid #cbcbcb;
}
.introduce-html h3{
    font-size:24px;
}

.introduce-html pre{
    display: block;
    background-color: #f0f0f0;
    padding: 5px;
    border-radius: 5px;
}
.introduce-html pre>code{
    color: #000;
    background-color: #f0f0f0;
}
.introduce-html code {
    background-color: #fff5f5;
    padding: 5px 10px;
    border-radius: 5px;
    margin: 0px 3px; 
    color: #ff502c; 
}
.introduce-html blockquote{
    border-left:4px solid #cbcbcb ;
    padding: 10px 10px 10px 30px; 
    background-color: #f8f8f8;
}
.date-select{
    margin-top:10px;
}
然后你就可以编写UI部分的代码了，这部分我们依然使用Ant Desgin的代码,先编写一个最基本的架构。


function AddArticle(){
    return (
      <div>我是添加文章</div>
    )
}
export default AddArticle
写完简单的这个，可以到AdminIndex.js中去配置路由，新引入路由模块，然后再引入对应的JS文件。

import { Route } from "react-router-dom";
import AddArticle from './AddArticle'
然后在主界面的操作内容区域加入下面的路由代码。

 <div style={{ padding: 24, background: '#fff', minHeight: 360 }}> 
    <div>
      <Route path="/index/" exact  component={AddArticle} />
    </div>
</div>
做完这步可以到浏览器中预览看一下，是不是可以访问到添加文章页面，如果访问不到，可以到Main.js文件中，删除exact（精确匹配），应该就可以访问到了。

编写标题和文章内容区域
路由调通后，就可以编写基本的UI样式了，我们先根据图片把标题和UI部分做好。先把大体架构制作完成，也就是大体分区。

<div>
  <Row gutter={5}>
      <Col span={18}>
      </Col>
      <Col span={6}>
      </Col>
  </Row>
</div>
这时我们把也买你分成了两栏，我们先来晚上左边的部分,也就是标题和文章内容。

<div>
<Row gutter={5}>
    <Col span={18}>
            <Row gutter={10} >
                <Col span={20}>
                    <Input 
                          placeholder="博客标题" 
                          size="large" />
                </Col>
                <Col span={4}>
                    &nbsp;
                    <Select defaultValue="Sign Up" size="large">
                        <Option value="Sign Up">视频教程</Option>
                    </Select>
                </Col>
            </Row>
            <br/>
            <Row gutter={10} >
                <Col span={12}>
                    <TextArea 
                        className="markdown-content" 
                        rows={35}  
                        placeholder="文章内容"
                        />
                </Col>
                <Col span={12}>
                    <div 
                        className="show-html">

                    </div>

                </Col>
            </Row>  

    </Col>

    <Col span={6}>


    </Col>
</Row>
</div>
这步完成可以到浏览器中预览一下啊，看看是否是我们想要的效果，然后根据个人喜好进行微调。这节课就先到这里。下节课我们来完善Markdown代码的编写和预览功能的实现。

p30：后台开发06-添加文章页面制作2
这节课继续上节课完成界面制作，那我们就话不多说，直接写代码了。


暂存按钮和发布按钮
先来制作右侧最顶部的两个按钮，这个两个按钮一个是暂存，就是你可以把文章存一下，但是不发布，一个是直接发布。（如果你感觉比较麻烦，可以先不做暂存功能，只做一个发布功能）。

<Col span={6}>
  <Row>
      <Col span={24}>
              <Button  size="large">暂存文章</Button>&nbsp;
              <Button type="primary" size="large" onClick={}>发布文章</Button>
              <br/>
      </Col>
  </Row>
</Col>
编写文章简介部分
这部分我们也采用<TextArea>组件，预览部分直接使用<div>标签就可以实现。下节课我们会解析Markdown。

<Col span={24}>
    <br/>
    <TextArea 
        rows={4} 
        placeholder="文章简介"
    />
    <br/><br/>
    <div  className="introduce-html"></div>
</Col>
这个编写完成以后，就剩下最后一部，就是编写发布时间。

编写发布时间界面
目前我们只用一个编写时间，最后修改时间我们可以以后再添加，目前没有什么用处。所以只写一个日期选择框就可以了。


<Col span={12}>
    <div className="date-select">
        <DatePicker
            placeholder="发布日期"
            size="large"  
        />
      </div>
</Col>
这样我们整个后台添加文章的界面就编写完成了。可以到浏览器中预览一下结果了。如果界面不满意，你可以自己调整一下。这节课就到这里，下节课我们主要把Markdown解析和预览的交互效果做一下。

p31：后台管理系统开发07-Markdown编辑器制作
界面制作好以后，我们可以自己制作一个Markdown编辑器，我们作的也没内那么麻烦，只要支持Markdown语法的编写，并且能实时预览就可以。


声明对应的useState
在function的头部直接声明对应的useState,代码如下(为了以后方便，我们在这里把所有的useState都声明出来)：

   const [articleId,setArticleId] = useState(0)  // 文章的ID，如果是0说明是新增加，如果不是0，说明是修改
   const [articleTitle,setArticleTitle] = useState('')   //文章标题
   const [articleContent , setArticleContent] = useState('')  //markdown的编辑内容
   const [markdownContent, setMarkdownContent] = useState('预览内容') //html内容
   const [introducemd,setIntroducemd] = useState()            //简介的markdown内容
   const [introducehtml,setIntroducehtml] = useState('等待编辑') //简介的html内容
   const [showDate,setShowDate] = useState()   //发布日期
   const [updateDate,setUpdateDate] = useState() //修改日志的日期
   const [typeInfo ,setTypeInfo] = useState([]) // 文章类别信息
   const [selectedType,setSelectType] = useState(1) //选择的文章类别
设置marked
声明完成后需要对marked进行基本的设置，这些设置我已经都讲过，这里就直接给出代码了。

   marked.setOptions({
    renderer: marked.Renderer(),
    gfm: true,
    pedantic: false,
    sanitize: false,
    tables: true,
    breaks: false,
    smartLists: true,
    smartypants: false,
  }); 
编写实时预览对应的方法
实现实时预览非常简单，作两个对应的方法，在onChange事件触发时执行就可以。方法体也只是用marked进行简单的转换，当然对应的CSS是我们对应好的。

   const changeContent = (e)=>{
       setArticleContent(e.target.value)
       let html=marked(e.target.value)
       setMarkdownContent(html)
   }

   const changeIntroduce = (e)=>{
        setIntroducemd(e.target.value)
        let html=marked(e.target.value)
        setIntroducehtml(html)
    }
编写onChange相应事件
 <TextArea
    value={articleContent} 
  className="markdown-content" 
  rows={35}  
  onChange={changeContent} 
  onPressEnter={changeContent}
  placeholder="文章内容"
  />
  <div 
      className="show-html"
      dangerouslySetInnerHTML = {{__html:markdownContent}} >

  </div>
<TextArea 
      rows={4} 
      value={introducemd}  
      onChange={changeIntroduce} 
      onPressEnter={changeIntroduce}
      placeholder="文章简介"
  />
<div 
    className="introduce-html"
    dangerouslySetInnerHTML = {{__html:'文章简介：'+introducehtml}} >
</div>
这样就完成了Markdown编辑器的编写，可以到浏览器中预览一下结果了。

p32：后台开发08-编写service登录接口
现在我们已经有了连个最基础的后台页面，可以作登录的业务逻辑制作了。这节课就制作一下中台的登录接口。


新建main.js文件
在/service/controller/admin文件夹下新建一个main.js文件，后台用的接口我们就都写在这个文件里了，当然你也可以写多个文件，进一步详细划分。

建立好文件后，我们编写下面代码:


'use strict';

const Controller = require('egg').Controller

class MainController extends Controller{

    async index(){
        //首页的文章列表数据
        this.ctx.body='hi api'
    }

}

module.exports = MainController
有了文件主体，下一步可以制作对应的路由了。

中台路由的制作
在/service/router文件夹下，新建立一个admin.js文件，用于配置后台接口文件的路由。 路由的代码如下：

module.exports = app =>{
    const {router,controller} = app
    router.get('/admin/index',adminauth ,controller.admin.main.index)
}
路由配置好以后还需要再总的router.js利进行配置，代码如下:

'use strict';
/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {

  require('./router/default')(app)
  require('./router/admin')(app)
};

这时候路由就起作用了，然后我们再服务端打开服务，到浏览器预览一下，如果可以顺利在页面输出hi api,说明一切正常了。

路径为：http://localhost:7001/admin/index/

登录方法的编写
然后我们在/service/controller/admin/main.js文件里编写验证登录的方法，代码如下:


 //判断用户名密码是否正确
  async checkLogin(){
      let userName = this.ctx.request.body.userName
      let password = this.ctx.request.body.password
      const sql = " SELECT userName FROM admin_user WHERE userName = '"+userName +
                  "' AND password = '"+password+"'"

      const res = await this.app.mysql.query(sql)
      if(res.length>0){
          //登录成功,进行session缓存
          let openId=new Date().getTime()
          this.ctx.session.openId={ 'openId':openId }
          this.ctx.body={'data':'登录成功','openId':openId}

      }else{
          this.ctx.body={data:'登录失败'}
      } 
  }
具体的代码解释我会在视频中解读，如果你对代码有什么不理解，可以直接看视频。这节课就到这里，下节课我们结合前台实现管理员登录的操作。

p33：后台开发09-实现前台登录操作
上节课已经把后台的登录接口和数据库制作好了，这节课就主要实现前台和后台的对接。当然这也不是登录的全部，登录全部我们还要作登录守卫，这个我们可以放在下节课来学习。


设置路由
当中台接口制作完成后，需要先进行路由的设置，打开/service/app/router文件夹下的admin.js文件。

router.post('/admin/checkOpenId',controller.admin.main.checkLogin)
中台路由配置好以后，还要去后台进行配置，打开/admin/config/apiUrl.js文件。加入下面的代码。

checkLogin:ipUrl + 'checkLogin' ,  //  检查用户名密码是否正确
这样路由模块就设置完成了，也就是说前台可以访问到这个中台接口了。

后台登录方法编写checkLogin
当我们点击登录按钮后，就要去后台请求接口，验证输入的用户名和密码是否正确，如果正确跳到博客管理界面，如果不正确在登录页面进行提示。

代码如下：

 const checkLogin = ()=>{
        setIsLoading(true)

        if(!userName){
            message.error('用户名不能为空')
            return false
        }else if(!password){
            message.error('密码不能为空')
            return false
        }
        let dataProps = {
            'userName':userName,
            'password':password
        }
        axios({
            method:'post',
            url:servicePath.checkLogin,
            data:dataProps,
            withCredentials: true
        }).then(
           res=>{
                setIsLoading(false)
                if(res.data.data=='登录成功'){
                    localStorage.setItem('openId',res.data.openId)
                    props.history.push('/index')
                }else{
                    message.error('用户名密码错误')
                }
           }
        )

        setTimeout(()=>{
            setIsLoading(false)
        },1000)
    }
代码的详细解释，我会在视频中进行讲解，你可以看一下视频中的讲解。

增加相应事件
有了登录方法后，后台就可以通过按钮调用这个方法，代码如下：

<Button type="primary" size="large" block onClick={checkLogin} > Login in </Button>
如果出现跨域问题，可以到config.default.js里进行设置配置。

 config.security = {
　　　　csrf: {enable: false},
　　　　domainWhiteList: [ '*' ]
　　};
  config.cors = {
    origin: 'http://localhost:3000',
    credentials: true,  //允许Cook可以跨域
    allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH,OPTIONS'
    };
这个配置后，就应该可以解决了。

为了方便你的学习,我这里给出整个页面的代码，方便你出错时自行查找。


import React , {useState,useEffect,createContext} from 'react';
import 'antd/dist/antd.css';
import '../static/css/Login.css';
import { Card, Input, Icon,Button ,Spin,message } from 'antd';
import axios from 'axios'
import  servicePath  from '../config/apiUrl'

const openIdContext = createContext()

function Login(props){

    const [userName , setUserName] = useState('')
    const [password , setPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    useEffect(()=>{

    },[])

    const checkLogin = ()=>{
        setIsLoading(true)

        if(!userName){
            message.error('用户名不能为空')
            return false
        }else if(!password){
            message.error('密码不能为空')
            return false
        }
        let dataProps = {
            'userName':userName,
            'password':password
        }
        axios({
            method:'post',
            url:servicePath.checkLogin,
            data:dataProps,
            withCredentials: true
        }).then(
           res=>{
                console.log(res.data)
                setIsLoading(false)
                if(res.data.data=='登录成功'){
                    localStorage.setItem('openId',res.data.openId)
                    props.history.push('/index')
                }else{
                    message.error('用户名密码错误')
                }


           }
        )

        setTimeout(()=>{
            setIsLoading(false)
        },1000)
    }

    return (
        <div className="login-div">

            <Spin tip="Loading..." spinning={isLoading}>
                <Card title="JSPang Blog  System" bordered={true} style={{ width: 400 }} >
                    <Input
                        id="userName"
                        size="large"
                        placeholder="Enter your userName"
                        prefix={<Icon type="user" style={{color:'rgba(0,0,0,.25)'}} />}
                        onChange={(e)=>{setUserName(e.target.value)}}
                    /> 
                    <br/><br/>
                    <Input.Password
                        id="password"
                        size="large"
                        placeholder="Enter your password"
                        prefix={<Icon type="key" style={{color:'rgba(0,0,0,.25)'}} />}
                        onChange={(e)=>{setPassword(e.target.value)}}
                    />     
                    <br/><br/>
                    <Button type="primary" size="large" block onClick={checkLogin} > Login in </Button>
                </Card>
            </Spin>
        </div>
    )
}

export default Login
这步完成后，可以到浏览器中预览一下结果，如果一切正常，下节课我们就可以制作中台的路由守卫了。

p34：后台开发10-中台路由守卫制作
现在我们的博客系统已经可以登录了，并且登录后，我们生成了session，通过后台是不是存在对应的session，作一个中台的路由守卫。如果没有登录，是不允许访问后台对应的接口，也没办法作对应的操作。这样就实现了接口的安全。


编写守卫方法
其实守卫方法是通过egg.js中间件来实现的middleware，所以我们需要先建立一个middleware文件夹。在/service/app/文件夹下面，建立一个mindleware文件夹，然后在文件夹下面建立一个adminauth.js文件。

module.exports = options =>{
    return async function adminauth(ctx,next){
        console.log(ctx.session.openId)
        if(ctx.session.openId){
            await next()
        }else{
            ctx.body={data:'没有登录'}
        }
    }
}
可以看到路由守卫是一个异步的方法，如果验证session成功，就会用await netx() 向下执行。也就是说可以正常向下走流程，如果验证失败，就直接返回“没有登录。

前后台分离共享session的方法
在正常情况下前后台是不能共享session的，但是只要在egg端的/config/config.default.js里增加credentials:true就可以了。

config.cors = {
    origin: 'http://localhost:3000',
    credentials: true,  //允许Cook可以跨域
    allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH,OPTIONS'
    };
然后在后台使用axios请求时，也带上这个参数就可以了。我们先做好中间件，等到使用时在详细讲解。

使用中间件实现路由守卫
中间件制作好了，我们可以制作在路由界面进行配置，打开/service/app/router/admin.js文件，先声明并引入中间件。

 const {router,controller} = app
 var adminauth = app.middleware.adminauth()
然后使用的时候，直接放在第二个参数里，就可以了。这节课就到这里，下节课我们讲编写添加文章的方法，然后添加问政的接口中会加入路由守卫。那我们下节课见了。

p35：后台开发11-读取添加文章页面的类别信息
上节课我们把后台添加文章的UI和守卫都已经作好了，那这节课制作从后台开一个读取文章类别的接口，然后从接口中获得数据，展现在添加文章页面上，方便以后选择文章类别，重点是联系如何通过路由守卫守护接口的。


编写获取文章类别的接口
打开service文件夹，然后进入/app/controller/admin/main.js文件，然后编写getTypeInfo（）方法，这里直接使用egg-mysql提供的API就可以得到。

代码如下：

//后台文章分类信息
async getTypeInfo(){
    const resType = await this.app.mysql.select('type')
    this.ctx.body={data:resType}
}
编写中台路由
当方法写完后，还不能直接使用，需要到/app/router/admin/admin.js中进行配置，这个接口我们就添加了路由守卫，也就是说你不登录，去访问这个接口是无效的，会返回让你去登录的。

module.exports = app =>{
    const {router,controller} = app
    var adminauth = app.middleware.adminauth()
    router.get('/admin/index',controller.admin.main.index)
    router.get('/admin/getTypeInfo',adminauth ,controller.admin.main.getTypeInfo)
}
这样编程完成后，后台就可以访问到这个接口了。

后台apiUrl.js的设置
当我们的接口都写完了之后，我们需要到后台作一下访问的统一管理文件，我经常使用apiUrl.js这个名字来命名文件，这个文件其实就是一个对象，里边是后台用到的所有接口，前面的课程中，我也有提到过。

let ipUrl = 'http://127.0.0.1:7001/admin/' 

let servicePath = {
    getTypeInfo:ipUrl + 'getTypeInfo' ,  //  获得文章类别信息
    checkLogin:ipUrl + 'checkLogin' ,  //  检查用户名密码是否正确
}

export default servicePath;
这样设置代码的好处是以后我们更换正式环境的时候非常简单，直接修改ipUrl变量的值就可以了。

在添加文章页面显示出类别
先引入Select、axios和servicePath，代码如下。

import { Row, Col ,Input, Select ,Button ,DatePicker ,message } from 'antd'
import axios from 'axios'
import  servicePath  from '../config/apiUrl'
用React hooks增加useState参数和方法，在组件头部增加代码如下：

   const [typeInfo ,setTypeInfo] = useState([]) // 文章类别信息
引入后编写getTypeInfo方法，代码如下：


 //从中台得到文章类别信息
  const getTypeInfo =()=>{

        axios({
            method:'get',
            url:servicePath.getTypeInfo,
            header:{ 'Access-Control-Allow-Origin':'*' },
            withCredentials: true
        }).then(
           res=>{
               if(res.data.data=="没有登录"){
                 localStorage.removeItem('openId')
                 props.history.push('/')  
               }else{
                setTypeInfo(res.data.data)
               }

            }
        )
  }js
方法写好后，直接在useEffect里进行使用就可以了

  useEffect(()=>{
    getTypeInfo() 
   },[])
最后编写JSX部分代码就可以了，这里用map进行了循环，代码如下：


<Col span={4}>
    &nbsp;
    <Select defaultValue={selectedType} size="large" onChange={selectTypeHandler}>
        {
            typeInfo.map((item,index)=>{
                return (<Option key={index} value={item.Id}>{item.typeName}</Option>)
            })
        }


    </Select>
</Col>
如果一切正常，这时候就可以显示出对应的文章信息列表了。这节课就到这里，主要讲解了如何使用路由守卫和中台接口的配合，读出对应的文章类别信息。代码虽然不多，但是还是希望多多练习一下。

P36：后台开发12-添加文章的方法(上)
这节的目的就是把文章中的内容添加到数据库中，内容虽然比较多，但是很多知识我们已经熟悉，都是利用axios对数据库进行操作。


选择类别后调用方法
现在选择文章类别后，前台还没办法根据选择的内容进行改变，这是我们使用了React Hooks的后遗症，必须使用对应set方法才可以改变state的值。

先编写selectTypeHangdler方法，代码如下：


   //选择类别后的便哈
    const selectTypeHandler =(value)=>{
        setSelectType(value)
    }
然后再<Select>组件上的onChange事件上进行调用，代码如下：

 <Select defaultValue={selectedType} size="large" onChange={selectTypeHandler}>
    {
        typeInfo.map((item,index)=>{
            return (<Option key={index} value={item.Id}>{item.typeName}</Option>)
        })
    }
</Select>
然后进行调试修改，对selectedType初始值进行初始化设置。

对发布时间文本框修改
选择文章可用后，修改发布日期对应的文本框，增加相应方法，让选择日期文本框也变的可用，代码如下:

<Col span={12}>
    <div className="date-select">
        <DatePicker
            onChange={(date,dateString)=>setShowDate(dateString)} 
            placeholder="发布日期"
            size="large"

        />
        </div>
</Col>
再对文章标题文本框进行修改
标题对应的文本框也要进行对相应的操作，代码如下:

<Col span={16}>
    <Input 
            value={articleTitle}
            placeholder="博客标题" 
            onChange={e=>{

            setArticleTitle(e.target.value)
            }}
            size="large" />
</Col>
编写文章保存方法
这些基本的操作都完成后，我们可以编写文章的保存方法，这节课我们只先作为空的验证，先不向数据库里插入数据，下节课在编写玩中台接口后，我们再进行插入。


    const saveArticle = ()=>{
        if(!selectedType){
            message.error('必须选择文章类别')
            return false
        }else if(!articleTitle){
            message.error('文章名称不能为空')
            return false
        }else if(!articleContent){
            message.error('文章内容不能为空')
            return false
        }else if(!introducemd){
            message.error('简介不能为空')
            return false
        }else if(!showDate){
            message.error('发布日期不能为空')
            return false
        }
        message.success('检验通过')
    }
然后在保存按钮的部分添加上onClick事件，代码如下：

<Col span={24}>
        <Button  size="large">暂存文章</Button>&nbsp;
        <Button type="primary" size="large" onClick={saveArticle}>发布文章</Button>
        <br/>
</Col>
然后就可以点击预览了，看看是否可以操作，进行调试。

P37：后台开发13-添加文章的方法(中)
接着上节课的内容继续完成添加文章的方法，这节课主要是完善中台接口和后台的saveArticle方法。


编写中台的addArticle接口
到service文件夹下面的/app/controller/admin/main.js文件里，新编写一个添加文章的方法addArticle()。代码如下:

//添加文章
async addArticle(){

    let tmpArticle= this.ctx.request.body
    // tmpArticle.
    const result = await this.app.mysql.insert('article',tmpArticle)
    const insertSuccess = result.affectedRows === 1
    const insertId = result.insertId

    this.ctx.body={
        isScuccess:insertSuccess,
        insertId:insertId
    }
}
编写对应的路由
方法写完了还需要配置路由，才能让后台管理系统访问，所以这里添加需要到/app/router/admin.js里进行配置，代码如下：


module.exports = app =>{
    const {router,controller} = app
    var adminauth = app.middleware.adminauth()
    router.get('/admin/index',controller.admin.main.index)
    router.get('/admin/getTypeInfo',adminauth ,controller.admin.main.getTypeInfo)
    router.post('/admin/addArticle',adminauth,controller.admin.main.addArticle)

}
注意，这里我们也使用了中间件，只要不登录是没办法操作这个接口的。

配置apiUrl.js文件
中台的接口配置完成后，还是按照惯例到/admin/src/config/apiUrl.js中配置接口的路径，代码如下:


let ipUrl = 'http://127.0.0.1:7001/admin/' 

let servicePath = {
    getTypeInfo:ipUrl + 'getTypeInfo' ,  //  获得文章类别信息
    addArticle:ipUrl + 'addArticle' ,  //  添加文章
    checkLogin:ipUrl + 'checkLogin' ,  //  检查用户名密码是否正确
}

export default servicePath;
编写saveArticle方法
现在可以利用axios来向数据库里添加文章信息了，代码如下（详细解释会在视频中讲解）.


//保存文章的方法
const saveArticle = ()=>{

    markedContent()  //先进行转换


    if(!selectedType){
        message.error('必须选择文章类别')
        return false
    }else if(!articleTitle){
        message.error('文章名称不能为空')
        return false
    }else if(!articleContent){
        message.error('文章内容不能为空')
        return false
    }else if(!introducemd){
        message.error('简介不能为空')
        return false
    }else if(!showDate){
        message.error('发布日期不能为空')
        return false
    }

    let dataProps={}   //传递到接口的参数
    dataProps.type_id = selectedType 
    dataProps.title = articleTitle
    dataProps.article_content =articleContent
    dataProps.introduce =introducemd
    let datetext= showDate.replace('-','/') //把字符串转换成时间戳
    dataProps.addTime =(new Date(datetext).getTime())/1000


    if(articleId==0){
        console.log('articleId=:'+articleId)
        dataProps.view_count =Math.ceil(Math.random()*100)+1000
        axios({
            method:'post',
            url:servicePath.addArticle,
            data:dataProps,
            withCredentials: true
        }).then(
            res=>{
                setArticleId(res.data.insertId)
                if(res.data.isScuccess){
                    message.success('文章保存成功')
                }else{
                    message.error('文章保存失败');
                }

            }
        )
    }


 } 
这个方法编写完成后，可以到浏览器中进行微调，如果保存成功，说明我们的编写没有错误，下节课可以继续作修改相关的操作，引文我们写博客的时候是经常需要保存的。所以只添加是不行的，还要保存。

P38：后台开发14-添加文章的方法(下)
这节继续晚上后台文章的添加，上节课已经实现了加入数据库，但加入后如果我们再改动，再点击保存按钮就会又新增加一条记录，这并不是我们想要的，这时候应该是修改，而不是从新增加一条新的数据。我们这节就主要实现这个功能。


编写中台接口方法
那要修改数据库里的记录，一定是通过中台接口来实现的，这时候我们需要在/service/app/controller/admin/main.js文件中，重新写一个方法updateArticle方法。

代码如下:

//修改文章
async updateArticle(){
    let tmpArticle= this.ctx.request.body

    const result = await this.app.mysql.update('article', tmpArticle);
    const updateSuccess = result.affectedRows === 1;
    console.log(updateSuccess)
    this.ctx.body={
        isScuccess:updateSuccess
    }
}  
编写完成后记得配置对应的路由，到/service/app/router/admin.js中修改代码。

module.exports = app =>{
    const {router,controller} = app
    var adminauth = app.middleware.adminauth()
    router.get('/admin/index',controller.admin.main.index)
    router.get('/admin/getTypeInfo',adminauth ,controller.admin.main.getTypeInfo)
    router.post('/admin/addArticle',adminauth,controller.admin.main.addArticle)
    router.post('/admin/updateArticle',adminauth,controller.admin.main.updateArticle)
}
记得加上中间件的守护，这样才能保证不被恶意调用。这样中台部分就编写完成了。

后台apiUrl.js的配置
中台配置完成后，需要到后台里管理对应的请求路径文件，也就是/admin/src/config/apiUrl.js文件。

let ipUrl = 'http://127.0.0.1:7001/admin/' 

let servicePath = {
    getTypeInfo:ipUrl + 'getTypeInfo' ,  //  获得文章类别信息
    addArticle:ipUrl + 'addArticle' ,  //  添加文章
    updateArticle:ipUrl + 'updateArticle' ,  //  修改文章第api地址
    checkLogin:ipUrl + 'checkLogin' ,  //  检查用户名密码是否正确
}

export default servicePath;
这步完成后，后台管理页面就可以调用接口，修改数据库里的数据了。

后台保存方法的修改
上节课我们在保存时，使用了判断，if(articleId===0),如果等于0说明时新添加，如果不等于0，说明时修改，那这时候只要修改else里的代码就可以完成修改操作了。

新添加的代码，也就是else中的代码:


else{

    dataProps.id = articleId 
    axios({
        method:'post',
        url:servicePath.updateArticle,
        header:{ 'Access-Control-Allow-Origin':'*' },
        data:dataProps,
        withCredentials: true
    }).then(
        res=>{

        if(res.data.isScuccess){
            message.success('文章保存成功')
        }else{
            message.error('保存失败');
        }


        }
    )
}
为了方便你学习，我这里给出全部代码，你可以直接复制实现效果。

    //保存文章的方法
    const saveArticle = ()=>{

        markedContent()  //先进行转换


        if(!selectedType){
            message.error('必须选择文章类别')
            return false
        }else if(!articleTitle){
            message.error('文章名称不能为空')
            return false
        }else if(!articleContent){
            message.error('文章内容不能为空')
            return false
        }else if(!introducemd){
            message.error('简介不能为空')
            return false
        }else if(!showDate){
            message.error('发布日期不能为空')
            return false
        }







        let dataProps={}
        console.log(selectedType)
        dataProps.type_id = selectedType 
        dataProps.title = articleTitle
        dataProps.article_content =articleContent
        dataProps.introduce =introducemd
        let datetext= showDate.replace('-','/') //把字符串转换成时间戳
        dataProps.addTime =(new Date(datetext).getTime())/1000
        dataProps.part_count = partCount
        dataProps.article_content_html = markdownContent
        dataProps.introduce_html = introducehtml

        if(articleId==0){
            console.log('articleId=:'+articleId)
            dataProps.view_count =Math.ceil(Math.random()*100)+1000
            axios({
                method:'post',
                url:servicePath.addArticle,
                header:{ 'Access-Control-Allow-Origin':'*' },
                data:dataProps,
                 withCredentials: true
            }).then(
               res=>{
                setArticleId(res.data.insertId)
                if(res.data.isScuccess){
                    message.success('文章发布成功')
                }else{
                    message.error('文章发布失败');
                }

               }
            )
        }else{
            console.log('articleId:'+articleId)
            dataProps.id = articleId 
            axios({
                method:'post',
                url:servicePath.updateArticle,
                header:{ 'Access-Control-Allow-Origin':'*' },
                data:dataProps,
                withCredentials: true
            }).then(
               res=>{

                if(res.data.isScuccess){
                    message.success('文章保存成功')
                }else{
                    message.error('保存失败');
                }


               }
            )
        }


    } 
这步完成，就可以实现修改文章的操作了，你可以到浏览器中去测试一下，再进行必要的微调操作。如果一切正常，这节课就到这里了，下节课我们开始制作后台的文章列表页面。

P39：后台开发15-文章列表制作(上)
目前已经可以添加博客文章了，然后我们需要作一个文章列表，方便我们后续的删除和修改操作。我们先把接口和页面布局做好。


建立ArticleList.js文件
我们在/admin/src/pages文件夹下新建立一个ArticleList.js文件。

然后先import引入一些必须要使用的包。


import React,{useState,useEffect} from 'react';
import '../static/css/ArticleList.css'
import { List ,Row ,Col , Modal ,message ,Button,Switch} from 'antd';
import axios from 'axios'
import  servicePath  from '../config/apiUrl'
const { confirm } = Modal;
上面这些都是我们需要用到的包，所以就一次性的都引入进来了，以后如果再增加，可以再次引入。 然后编写一下基本的结构，让页面基本可用。

function ArticleList(props){

    const [list,setList]=useState([])
    return (
        <div>
             <List
                header={
                    <Row className="list-div">
                        <Col span={8}>
                            <b>标题</b>
                        </Col>
                        <Col span={3}>
                            <b>类别</b>
                        </Col>
                        <Col span={3}>
                            <b>发布时间</b>
                        </Col>
                        <Col span={3}>
                            <b>集数</b>
                        </Col>
                        <Col span={3}>
                            <b>浏览量</b>
                        </Col>

                        <Col span={4}>
                            <b>操作</b>
                        </Col>
                    </Row>

                }
                bordered
                dataSource={list}
                renderItem={item => (
                    <List.Item>
                        <Row className="list-div">
                            <Col span={8}>
                                {item.title}
                            </Col>
                            <Col span={3}>
                             {item.typeName}
                            </Col>
                            <Col span={3}>
                                {item.addTime}
                            </Col>
                            <Col span={3}>
                                共<span>{item.part_count}</span>集
                            </Col>
                            <Col span={3}>
                              {item.view_count}
                            </Col>

                            <Col span={4}>
                              <Button type="primary" >修改</Button>&nbsp;

                              <Button >删除 </Button>
                            </Col>
                        </Row>

                    </List.Item>
                )}
                />

        </div>
    )

}

export default ArticleList
编写对应的路由
当页面编写完成后，你需要编写路由，只有路由配置正常，你次能正常访问到这个页面。进入AdminIndex.js文件，然后主操作区添加路由。

 <div>
    <Route path="/index/" exact  component={AddArticle} />
    <Route path="/index/add/" exact   component={AddArticle} />
    <Route path="/index/add/:id"  exact   component={AddArticle} />
    <Route path="/index/list/"   component={ArticleList} />

</div>

···

然后找到文章管理，文章列表的部分，修改代码如下：

```js
<SubMenu
    key="sub1"
    onClick={handleClickArticle}
    title={
    <span>
        <Icon type="desktop" />
        <span>文章管理</span>
    </span>
    }
>
    <Menu.Item key="addArticle">添加文章</Menu.Item>
    <Menu.Item key="articleList">文章列表</Menu.Item>

</SubMenu>
引入ArticleList.js页面

import ArticleList from './ArticleList'
然后编写HandleClickArticle()方法，代码如下：


  const handleClickArticle = e=>{
    console.log(e.item.props)
    if(e.key=='addArticle'){
      props.history.push('/index/add')
    }else{
      props.history.push('/index/list')
    }

  }

然后到浏览器中预览一下，应该可以打开页面了，只是没有数据，但是页面是正常可以打开的。

如果你觉的页面不好看，可以加入一下CSS样式，但是记得单独在static/css文件夹下新建立一个ArticleList.css文件。

这节课就写到这里，下节课我们再进一步写中台的接口。

P40：后台开发16-文章列表制作(中)
这节的主要内容就是编写中台的列表方法，然后通过方法读取数据并显示再页面上，有了博客前台读取首页列表数据的经验后，你做起来应该不算什么难事了。


编写中台获取文章列表接口
直接进入/service/app/controller/admin文件夹下的main.js文件，然后编写一个新的getArticleList方法，代码如下:

//获得文章列表
async getArticleList(){

    let sql = 'SELECT article.id as id,'+
                'article.title as title,'+
                'article.introduce as introduce,'+
                "FROM_UNIXTIME(article.addTime,'%Y-%m-%d' ) as addTime,"+
                'type.typeName as typeName '+
                'FROM article LEFT JOIN type ON article.type_id = type.Id '+
                'ORDER BY article.id DESC '

        const resList = await this.app.mysql.query(sql)
        this.ctx.body={list:resList}

}
编写完方法后记得要配置路由，打开/router文件夹的admin.js文件。

module.exports = app =>{
    const {router,controller} = app
    var adminauth = app.middleware.adminauth()
    router.get('/admin/index',controller.admin.main.index)
    router.get('/admin/getTypeInfo',adminauth ,controller.admin.main.getTypeInfo)
    router.post('/admin/addArticle',adminauth,controller.admin.main.addArticle)
    router.post('/admin/updateArticle',adminauth,controller.admin.main.updateArticle)
    router.get('/admin/getArticleList',adminauth,controller.admin.main.getArticleList)
}
其实只要添加最后一行代码就可以完成路由的设置。

配置apiUrl.js文件
后台配置完成，再到admin文件夹加下的/src/config/apiUrl.js文件，配置中台对应的路径。

let ipUrl = 'http://127.0.0.1:7001/admin/' 

let servicePath = {
    getTypeInfo:ipUrl + 'getTypeInfo' ,  //  获得文章类别信息
    addArticle:ipUrl + 'addArticle' ,  //  添加文章
    updateArticle:ipUrl + 'updateArticle' ,  //  添加文章
    getArticleList:ipUrl + 'getArticleList' ,  //  文章列表 
}

export default servicePath;
这时候后台就可以使用Axios来配置获得文章列表数据了。

后台Axios获取文章列表
我们再ArticleList.js文件里，写一个getList方法，代码如下:


//得到文章列表
const getList = ()=>{
    axios({
            method:'get',
            url: servicePath.getArticleList,
            withCredentials: true,
            header:{ 'Access-Control-Allow-Origin':'*' }
        }).then(
        res=>{
            setList(res.data.list)  

            }
        )
} 
当我们进入页面的使用，就希望可以获得博客文章的列表，所以要使用useEffect()方法来进行操作。

useEffect(()=>{
        getList()
    },[])
这就就可以进入页面就显示所有的文章列表了，这节课也就先到这里了。下节课我们就来编写列表页的相关操作。

P41：后台开发17-删除文章
列表上节课已经完成了，但是列表就是为了更方便的管理博客文章，这节我们就一起来完成文章的删除操作。删除操作需要注意的是要防止误删，就是不小心删错了，所以在删除前我们需要再次向用户询问是否删除。


删除文章中台方法编写
我们还是从中台开始编写，先把操作数据库的方法编写好，然后再来编写管理UI部分。

这个方法写在/servie/app/controller/admin/main.js文件里，我们起名叫做delArticle(),代码如下：

//删除文章
async delArticle(){
    let id = this.ctx.params.id
    const res = await this.app.mysql.delete('article',{'id':id})
    this.ctx.body={data:res}
}
写好方法后，还是需要到/router/admin.js文件中进行路由的配置。

module.exports = app =>{
    const {router,controller} = app
    var adminauth = app.middleware.adminauth()
    router.get('/admin/index',controller.admin.main.index)
    router.get('/admin/getTypeInfo',adminauth ,controller.admin.main.getTypeInfo)
    router.post('/admin/addArticle',adminauth,controller.admin.main.addArticle)
    router.post('/admin/updateArticle',adminauth,controller.admin.main.updateArticle)
    router.get('/admin/getArticleList',adminauth,controller.admin.main.getArticleList)
    router.get('/admin/delArticle/:id',adminauth,controller.admin.main.delArticle)
}
这个其实要写的就是最后一句，其他都是我们以前增加的路由。

编写apiUrl.js文件
到/admin/src/config/apiUrl.js里面，把这个路径添加上就可以了。

let ipUrl = 'http://127.0.0.1:7001/admin/' 

let servicePath = {
    getTypeInfo:ipUrl + 'getTypeInfo' ,  //  获得文章类别信息
    addArticle:ipUrl + 'addArticle' ,  //  添加文章
    updateArticle:ipUrl + 'updateArticle' ,  //  添加文章
    getArticleList:ipUrl + 'getArticleList' ,  //  文章列表 
    delArticle:ipUrl + 'delArticle/' ,  //  删除文章
}

export default servicePath;
这步做完就可以写前台的业务逻辑了。

管理页面删除方法编写
到/admin/src/pages/ArticleList文件中编写一个delArticle方法，在这个方法里我们要再次向用户确认是否删除这篇文章，如果用户统一才会确认删除。


//删除文章的方法
const delArticle = (id)=>{
    confirm({
        title: '确定要删除这篇博客文章吗?',
        content: '如果你点击OK按钮，文章将会永远被删除，无法恢复。',
        onOk() {
            axios(servicePath.delArticle+id,{ withCredentials: true}).then(
                res=>{ 
                    message.success('文章删除成功')
                    getList()
                    }
                )
        },
        onCancel() {
            message.success('没有任何改变')
        },
     });

}
在删除之后，我们又进行了一次数据库查询方法，虽然这不太环保，但是对于这样小概率事件是完全无所谓的。方法写完之后，就可以给按钮添加触发事件了。

<Button onClick={()=>{delArticle(item.id)}} >删除 </Button>
这样就可以实现删除了，我们可以到浏览器中进行测试一下，对不满意的地方进行微调。

P42：后台开发18-修改文章（上）
这节课我们的业务需求就是能修改文章，熟悉我的小伙伴都知道，我的文章一般都非常的长，需要1-3个月才能写完，因为我希望这是一个连贯的知识架构。所以修改文章每天都会发生，也尤为重要。 其实做到这里，你完全已经知道我们开发的流程和基本结构了，你也可以停下阅读，自己先做做试试，如果做不出来，你可以再回来看这个文章。


编写中台接口方法
到/service/app/controller/admin/main.js文件中，新增加一个根据文章ID得到文章详情的方法getArticleById(),代码如下:


//根据文章ID得到文章详情，用于修改文章
async getArticleById(){
    let id = this.ctx.params.id

    let sql = 'SELECT article.id as id,'+
    'article.title as title,'+
    'article.introduce as introduce,'+
    'article.article_content as article_content,'+
    "FROM_UNIXTIME(article.addTime,'%Y-%m-%d' ) as addTime,"+
    'article.view_count as view_count ,'+
    'type.typeName as typeName ,'+
    'type.id as typeId '+
    'FROM article LEFT JOIN type ON article.type_id = type.Id '+
    'WHERE article.id='+id
    const result = await this.app.mysql.query(sql)
    this.ctx.body={data:result}
}
写完方法后，设置到/router/admin.js中进行设置，代码如下：

module.exports = app =>{
    const {router,controller} = app
    var adminauth = app.middleware.adminauth()
    router.get('/admin/index',controller.admin.main.index)
    router.get('/admin/getTypeInfo',adminauth ,controller.admin.main.getTypeInfo)
    router.post('/admin/addArticle',adminauth,controller.admin.main.addArticle)
    router.post('/admin/updateArticle',adminauth,controller.admin.main.updateArticle)
    router.get('/admin/getArticleList',adminauth,controller.admin.main.getArticleList)
    router.get('/admin/getArticleById/:id',adminauth,controller.admin.main.getArticleById)
}
这个也只是添加了最后一行代码，也用中间件进行了守护。

修改apiUrl.js文件
打开/admin/src/config/apiUrl.js文件，编写接口路径。

let ipUrl = 'http://127.0.0.1:7001/admin/' 

let servicePath = {
    getTypeInfo:ipUrl + 'getTypeInfo' ,  //  获得文章类别信息
    addArticle:ipUrl + 'addArticle' ,  //  添加文章
    updateArticle:ipUrl + 'updateArticle' ,  //  添加文章
    getArticleList:ipUrl + 'getArticleList' ,  //  文章列表 
    delArticle:ipUrl + 'delArticle/' ,  //  删除文章
    getArticleById:ipUrl + 'getArticleById/' ,  //  根据ID获得文章详情
}

export default servicePath;
updateArticle方法编写
到/admin/src/pages/ArticleList.js文件中，编写用于跳转到添加页面的方法，只不过这个跳转需要带一个文章id过去，代码如下：

//修改文章
const updateArticle = (id,checked)=>{

    props.history.push('/index/add/'+id)

}
其实这个只是一个跳转的方法，剩下的业务逻辑部分会放到AddArticle.js中进行，由于篇幅和时间关系，剩下的部分下节课再继续做，这节你只知道这里就可以了。

P43：后台开发19-修改文章（下）
继续上节课作博客后台文章的修改，上节课已经可以跳转到添加页面了，这节课的主要内容就是把从接口中得到的数据，显示在页面上，然后进行修改。


getArticleById方法的编写
我们打开/admin/src/pages/AddArticle.js文件，然后在里边也添加一个getArticleById()方法，其实这个方法就是调用中台接口获得数据。

代码如下：

const getArticleById = (id)=>{
    axios(servicePath.getArticleById+id,{ 
        withCredentials: true,
        header:{ 'Access-Control-Allow-Origin':'*' }
    }).then(
        res=>{
            //let articleInfo= res.data.data[0]
            setArticleTitle(res.data.data[0].title)
            setArticleContent(res.data.data[0].article_content)
            let html=marked(res.data.data[0].article_content)
            setMarkdownContent(html)
            setIntroducemd(res.data.data[0].introduce)
            let tmpInt = marked(res.data.data[0].introduce)
            setIntroducehtml(tmpInt)
            setShowDate(res.data.data[0].addTime)
            setSelectType(res.data.data[0].typeId)

        }
    )
}

这样我们就完成了对页面上内容的赋值，现在只需要找个合适的机会调用这个方法就可以了。调用这个方法依然选择在useEffect方法中进行。

useEffect()方法的编写
其实我们原来已经多次使用过useEffect方法了，这里我们先获得ID，如果可以获得到值，说明就是修改，这时候我们再调用刚才写的getArticleById()方法。

代码如下：

useEffect(()=>{
    getTypeInfo()
    //获得文章ID
    let tmpId = props.match.params.id
    if(tmpId){
        setArticleId(tmpId)
        getArticleById(tmpId)
    } 
},[])
这样就可以通过传递过来的ID，获得对应的文章详细信息，并进行修改。做完这一步就可以到浏览器中测试一下，看看有什么Bug进行调试就可以了。

这节课是接着上节课讲的，所以内容不多，但是到目前为止，我们已经完成了博客文章增、删、改、查的所有后台管理操作。当然一个博客还会有很多其它不同内容，但是你学知识应该是一通百通的。

我相信小伙伴们接下来一定可以根据自己的需要做出更好的博客系统。那代码部分的课程就到这里了，下节课我会介绍一下如何把这套博客布置到公网上去，让所有人进行访问。

P44：博客部署介绍和演示
部署这套博客有很多种方法，也可以自动化部署。但你如果想学会部署，并且不花什么钱的的话，你至少要会以下这些知识。


Liunx相关操作，比如最简单的基础操作。
Linux下搭建MySql和Nginx。
Linux下进行内网穿透。
PM2的相关使用。
Linux相关安全设置，比如开端口，关端口，自动监控这些。
但是这些知识每一个都可以出一套教程来讲，所以不能完全给大家讲这些。但是我还要详细讲一下跟前端相关的操作

Blog前台部署
你需要把前台的相关代码拷贝到服务器上，然后使用PM2 来进行守护，当然你的Linux下安装了node、npm和PM2.

然后进入到前台代码的文件夹下，直接使用下面的命令进行开启。

pm2 start npm -- run start
这样你前台就可以开启成功了，但是你这时候并不能正常访问。因为我们需要开启中台，中台是提供给我们接口的。

中台的开启
中台我们使用了egg.js,它的开启非常简单，只要使用下面的命令.

npm run start
注意:egg是自带守护进程的，所以你没必要再用PM2守护，直接使用就可以了。

这时候前台就可以正常访问了。

后台管理的启用
其实我们的后台管理就是一个单页应用（SPA），也就是说可以完全生成静态的站点。

你直接在开发机上，使用npm run build就可以进行打包成静态页面。

然后直接把打好的包放到服务器种，利用nginx设置一个静态站点可以进行使用了。

写在最后
这套视频到本节就已经全部结束了，我相信小伙伴们对这个项目的知识点一定都有所了解，但是你们需要一点点敲出这个程序，还需要费一些功夫，希望小伙伴们继续努力。那2019年的视频就录制到这里了，我们2020年再见。


技术胖
专注于WEB和移动前端开发
光头Coder12年经验业余讲师免费视频605 集被访问286913次
社交账号



密圈公号QQ群

 只要50元/年 得4项福利
 视频离线高清版下载-400集

 每周至少两篇文章分享

 技术胖收费视频半价购买

 每天回答所提问题（选择性回答）

文章目录

}

module.exports = HomeController;
