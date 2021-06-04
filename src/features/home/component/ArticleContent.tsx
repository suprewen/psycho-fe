import React from 'react';
import { Icon, Tag, Empty } from 'antd';
import { Article, ArticleTopic } from '@features/common/types';

import "./ArticleContent.less"
import { articleTopicMap } from '@utils/map';

const fakeCover = 'https://ossimg.xinli001.com/20190417/8a3c53c18ee8b5d46d56815fd211d213.jpeg!120x120'
const covers = [
  'https://ossimg.xinli001.com/20210531/0c2a152dcbc4e4c028c750d6a184921c.jpeg!120x120',
  'https://ossimg.xinli001.com/20190417/8a3c53c18ee8b5d46d56815fd211d213.jpeg!120x120',
  'https://ossimg.xinli001.com/20210531/2c89cb52baf973f761cf4633546abd7c.jpeg!120x120',
  'https://ossimg.xinli001.com/20210602/b9200b5ebdb5e958926e07f64f9f938e.jpeg!120x120'
]

interface IArticleContentProps {
  list: Article[]
  showPost: boolean
  loadList: (c: ArticleTopic) => void
  seeMore: () => void
  seeDetail: (id: number) => void
  gotoPost: () => void
}

interface IArticleContentState {
  activeCategory: ArticleTopic
}

export default class ArticleContent extends React.Component<IArticleContentProps, IArticleContentState> {
  constructor(props: IArticleContentProps) {
    super(props)
    this.state = {
      activeCategory: 'all'
    }
  }
  renderArticleItem = () => {
    const { list, seeDetail } = this.props
    return list.length > 0 ? list.map(l => {
      const tags = l.tags === '' ? [] : l.tags.split(',')
      const excerpt = l.excerpt.length > 40 ? `${l.excerpt.substr(0, 40)}...` : l.excerpt
      return (
        <div className="item" key={l.id} onClick={() => seeDetail(l.id)}>
          <div className="cover" onClick={() => seeDetail(l.id)}>
            <img src={covers[parseInt(`${Math.random() * covers.length - 1}`)]} alt="" />
          </div>
          <div className="main">
            <div className="title" >{l.title}</div>
            <div className="excerpt">{excerpt}</div>
            <div className="tags">
              {
                tags.map(t => <Tag color="blue" key={t}>{t}</Tag>)
              }
            </div>
          </div>
        </div>
      )
    }) : <Empty />
  }
  loadList = (c: ArticleTopic) => {
    this.setState({
      activeCategory: c
    }, () => this.props.loadList(c))
  }
  render() {
    const active = this.state.activeCategory
    const { seeMore, gotoPost, showPost } = this.props
    return (
      <div className="article-content-wrapper">
        <div className="content">
          <div className="category-bar">
            {
              Object.keys(articleTopicMap).filter(k => k !== 'others').map(k => (
                <div
                  key={k}
                  className={active === k ? 'category active' : 'category'}
                  onClick={() => this.loadList(k as ArticleTopic)}
                >
                  {k === 'all' ? '最新热文' : articleTopicMap[k]}
                </div>
              ))
            }
            <div onClick={seeMore} className="category">更多分类</div>
            {
              showPost ? (
                <div className="post-button" onClick={gotoPost}>
                  <Icon type="highlight" /> 发布文章
                </div>
              ) : null
            }
          </div>
          <div className="list">
            {
              this.renderArticleItem()
            }
          </div>
        </div>
      </div>
    )
  }
}