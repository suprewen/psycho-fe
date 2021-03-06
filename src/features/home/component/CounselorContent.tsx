import React from 'react'
import './CounselorContent.less'
import ContentHeader from './ContentHeader'
import { Counselor } from '@features/common/types'
import { avatarURL } from '@features/common/fakeData'
import { Button, Icon, Tooltip } from 'antd'
import { Link } from 'react-router-dom';

interface ICounselorContentProps {
  seeMore: () => void
  gotoApply: () => void
  showApply: boolean
  seeDetail: (cid: number) => void
  list: Counselor[]
}

interface ICounselorContentState {
  activeSlide: number
}

export default class CounselorContent extends React.Component<
  ICounselorContentProps,
  ICounselorContentState
> {
  constructor(props: ICounselorContentProps) {
    super(props)
    this.state = {
      activeSlide: 0
    }
  }

  toggleActiveSlide = (type: 'prev' | 'next') => {
    const activeSlide = this.state.activeSlide
    if ((type === 'prev' && activeSlide === 0) || (type === 'next' && activeSlide === 2)) {
      return
    }
    this.setState(prevState => ({
      activeSlide: type === 'prev' ? prevState.activeSlide - 1 : prevState.activeSlide + 1
    }))
  }

  render() {
    const { seeMore, gotoApply, showApply, list } = this.props
    const activeSlide = this.state.activeSlide
    const swipeList = [list.slice(0, 4), list.slice(4, 8), list.slice(8, 10)].filter(
      v => v.length !== 0
    )
    const activeList = swipeList.length !== 0 ? swipeList[activeSlide] : []
    console.log('activeList', activeList)
    const isEnd = activeSlide === swipeList.length - 1
    const isStart = activeSlide === 0

    return (
      <div className="counselor-content-wrapper">
        <div className="counselor-content">
          <ContentHeader
            type="counselor"
            hideAction={!showApply}
          />
          <div className="swipe">
            <div
              className={isStart ? 'action prev disable' : 'action prev'}
              onClick={() => this.toggleActiveSlide('prev')}
            >
              <Icon type="left" />
            </div>
            <div className="list">
              {swipeList.length !== 0 &&
                activeList.map(l => {
                  const major = l.topic.id === 4 ? l.topicOther : l.topic.name
                  const desc = l.description.split('/').slice(0, 2)
                  return (
                    <div className="item" key={l.id}>
                      <div className="bg" />
                      <header>
                        <img className="avatar" src={avatarURL} alt="" />
                        <span>???????????????{l.serviceCount}???</span>
                        <p style={{ marginLeft: 20 }}>{l.name}</p>
                      </header>
                      <main>
                        <section className="desc">
                          {desc.map(d => (
                            <div key={d}>
                              {d.length > 9 ? <Tooltip title={d}>{d.substr(0, 8)}...</Tooltip> : d}
                            </div>
                          ))}
                        </section>
                        <section className="major">?????????{major}</section>
                      </main>
                      <footer>
                        <Link to={`/expert/${l.id}`}><Button type="primary">??????</Button></Link>
                      </footer>
                    </div>
                  )
                })}
            </div>
            <div
              className={isEnd ? 'action next disable' : 'action next'}
              onClick={() => this.toggleActiveSlide('next')}
            >
              <Icon type="right" />
            </div>
          </div>
        </div>
      </div>
    )
  }
}
