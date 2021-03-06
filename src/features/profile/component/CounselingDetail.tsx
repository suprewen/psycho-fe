import React from 'react'
import { RouteComponentProps, Redirect } from 'react-router'
import { connect } from 'react-redux'
import { OtherAPI, IApiResponse } from '@common/api/config'
import { ICounselingRecord } from './Counselor/CounselingTab'
import Loading from '@features/common/component/Loading'

import './CounselingDetail.less'
import { CounselingMethodMap, CounselingRecordStatusMap } from '@utils/map'
import { Tag, Button, notification, Modal, Icon, Rate } from 'antd'
import { avatarURL } from '@features/common/fakeData'
import { IStore } from '@common/storeConfig'
import ActionModal from './ActionModal'
import { Dispatch } from 'redux'
import { fetchAction } from '@common/api/action'
import { IApiState } from '@common/api/reducer'
import moment from '@utils/moment'
import { Link } from 'react-router-dom'

type ActionMap = { [key in keyof typeof CounselingRecordStatusMap]: React.ReactNode }

interface ICounselingDetailProps extends RouteComponentProps<{ recordID: string }> {
  authType: number
  dispatch: Dispatch
  processRes: IApiState
}

interface ICounselingDetailState {
  loading: boolean
  isValid?: boolean
  data?: ICounselingRecord

  showActionModal: boolean
  modalOp?: 0 | 1
}

class CounselingDetail extends React.Component<ICounselingDetailProps, ICounselingDetailState> {
  constructor(props: ICounselingDetailProps) {
    super(props)
    this.state = {
      loading: true,
      showActionModal: false
    }
  }

  closeActionModal = () => {
    this.setState({ showActionModal: false })
  }

  openActionModal = (op: 0 | 1) => {
    this.setState({
      modalOp: op,
      showActionModal: true
    })
  }

  handleProcess = (op: 0 | 1, data?: any) => {
    console.log(data)

    const rID = this.state.data.id
    const appendPath = `/${rID}/${op}`
    this.props.dispatch(fetchAction('operation/appointProcess', { data, appendPath }))
  }

  fetchData = (rID: number, callback?: () => void) => {
    OtherAPI.GetRecordDetail(rID)
      .then(res => {
        const resp: IApiResponse = res.data
        this.setState(
          {
            loading: false,
            isValid: resp.code === 1,
            data:
              resp.code === 1
                ? { ...resp.data, method: JSON.parse(resp.data.method).id }
                : undefined
          },
          callback
        )
      })
      .catch(err => {
        this.setState({
          loading: false,
          isValid: false
        })
      })
  }

  handleCompleteCounseling = () => {
    const startTime = moment(this.state.data.startTime).valueOf()
    const now = moment().valueOf()
    this.setState({
      modalOp: 1
    })
    if (now <= startTime) {
      Modal.confirm({
        title: '??????????????????????????????????????????????????????',
        onOk: () => this.handleProcess(1)
      })
    } else {
      this.handleProcess(1)
    }
  }

  componentDidUpdate = (prevProps: ICounselingDetailProps, prevState: ICounselingDetailState) => {
    if (!this.state.data) {
      return
    }

    // ????????????????????????????????????
    const prevRecordStatus = this.state.data.status
    const prevRes = prevProps.processRes
    const curRes = this.props.processRes
    const rID = this.state.data.id
    const isFinish = this.state.modalOp !== 0
    if (prevRecordStatus === 'wait_counseling' && prevRes.status === 'loading' && isFinish) {
      if (curRes.status === 'success' && curRes.response && curRes.response.code === 1) {
        notification.open({
          message: '????????????',
          description: '??????????????????????????????????????????',
          icon: <Icon type="smile" style={{ color: '#108ee9' }} />
        })
        this.fetchData(rID, () => this.openActionModal(1))
      } else if (curRes.response && curRes.response.code !== 1) {
        notification.error({
          message: '????????????',
          description: curRes.response.message,
          duration: null
        })
      } else {
        notification.error({
          message: '????????????',
          description: '????????????????????????????????????',
          duration: null
        })
      }
    }
  }

  componentDidMount() {
    const recordID = parseInt(this.props.match.params.recordID)
    if (isNaN(recordID)) {
      this.setState({
        loading: false,
        isValid: false
      })
    } else {
      this.fetchData(recordID)
    }
  }

  render() {
    const { loading, isValid, data } = this.state
    if (loading) {
      return <Loading />
    }

    if (!loading && isValid === false) {
      return <Redirect to="/" />
    }

    const userActionMap: ActionMap = {
      wait_contact: (
        <Button type="danger" onClick={() => this.openActionModal(0)}>
          ????????????
        </Button>
      ),
      wait_confirm: (
        <React.Fragment>
          <Button type="danger" onClick={() => this.openActionModal(0)}>
            ??????
          </Button>
          <Button type="primary" onClick={() => this.openActionModal(1)}>
            ??????
          </Button>
        </React.Fragment>
      ),
      wait_counseling: (
        <React.Fragment>
          <Button type="danger" onClick={() => this.openActionModal(0)}>
            ??????
          </Button>
          <Link to={`/profile/counselChat/${this.props.match.params.recordID}/${data.uID}/${data.cID}`}>
            <Button type="primary">
              ???????????????
            </Button>
          </Link>
          <Button onClick={this.handleCompleteCounseling}>
            ???????????????
          </Button>
        </React.Fragment>
      ),
      wait_comment: (
        <Button type="primary" onClick={() => this.openActionModal(1)}>
          ???????????????
        </Button>
      ),
      finish:
        data.letter === '' ? (
          <Button type="primary" onClick={() => this.openActionModal(1)}>
            ???????????????
          </Button>
        ) : null,
      cancel: null
    }

    const counselorActionMap: ActionMap = {
      wait_contact: (
        <React.Fragment>
          <Button type="danger" onClick={() => this.openActionModal(0)}>
            ??????
          </Button>
          <Button type="primary" onClick={() => this.openActionModal(1)}>
            ??????
          </Button>
        </React.Fragment>
      ),
      wait_confirm: null,
      wait_counseling: (
        <React.Fragment>
          <Link to={`/profile/counselChat/${this.props.match.params.recordID}/${data.cID}/${data.uID}`}>
            <Button type="primary">
              ???????????????
            </Button>
          </Link>
        </React.Fragment>
      ),
      wait_comment: null,
      finish: null,
      cancel: null
    }

    const isCounselor = this.props.authType === 1

    const InfoOthers =
      data.status === 'cancel' ? (
        <div className="section">
          <div className="title">??????</div>
          <div className="content">
            {data.cancelReason1 ? (
              <div>
                <span>?????????????????????</span> {data.cancelReason1}
              </div>
            ) : null}
            {data.cancelReason2 ? (
              <div>
                <span>?????????????????????</span> {data.cancelReason2}
              </div>
            ) : null}
          </div>
        </div>
      ) : data.status === 'finish' && (data.letter !== '' || data.ratingScore !== -1) ? (
        <div className="section">
          <div className="title">??????</div>
          <div className="content">
            {data.ratingScore !== -1 && !isCounselor ? (
              <React.Fragment>
                <div>
                  <span>????????????</span>{' '}
                  {data.ratingScore !== -1 ? (
                    <Rate disabled value={data.ratingScore} allowHalf />
                  ) : null}
                </div>
                <div>
                  <span>????????????</span> {data.ratingText !== '' ? data.ratingText : '???'}
                </div>
              </React.Fragment>
            ) : null}
            <div>
              <span>?????????</span>
              {data.letter === '' ? <p>??????</p> : <p>{data.letter}</p>}
            </div>
          </div>
        </div>
      ) : null

    const recordID = parseInt(this.props.match.params.recordID)

    return (
      <div className="counseling-detail">
        <div className="header">
          <div className="avatar">
            <img src={avatarURL} alt="" />
          </div>
          <div className="name">{data.counselorName}</div>
          <div className="status">
            <Tag color={CounselingRecordStatusMap[data.status].color}>
              {CounselingRecordStatusMap[data.status].text}
            </Tag>
          </div>
        </div>
        <div className="main">
          <div className="section">
            <div className="title">????????????</div>
            <div className="content">
              <div>
                <span>??????</span> {data.name}
              </div>
              <div>
                <span>??????</span> {data.gender === 1 ? '???' : '???'}
              </div>
              <div>
                <span>??????</span> {data.age}
              </div>
              <div>
                <span>??????</span> {data.phone}
              </div>
            </div>
          </div>
          <div className="section">
            <div className="title">?????????????????????</div>
            <div className="content">
              <div>
                <span>??????</span> {data.contactName}
              </div>
              <div>
                <span>??????</span> {data.contactRel}
              </div>
              <div>
                <span>??????</span> {data.contactPhone}
              </div>
            </div>
          </div>
          <div className="section">
            <div className="title">????????????</div>
            <div className="content">
              <div>
                <span>????????????</span> {CounselingMethodMap[data.method]}
              </div>
              <div>
                <span>????????????</span> {data.times}???
              </div>
              <div>
                <span>????????????</span> {data.startTime ? data.startTime : '??????'}
              </div>
              <div>
                <span>????????????</span> {data.location ? data.location : '??????'}
              </div>
              <div>
                <span>????????????</span>
                <p>{data.desc}</p>
              </div>
            </div>
          </div>
          {InfoOthers}
        </div>
        <div className="footer">
          <div className="actions">
            {isCounselor ? counselorActionMap[data.status] : userActionMap[data.status]}
          </div>
        </div>
        <ActionModal
          visible={this.state.showActionModal}
          closeModal={this.closeActionModal}
          isCounselor={isCounselor}
          record={data}
          operation={this.state.modalOp}
          onProcess={this.handleProcess}
          processRes={this.props.processRes}
          onReload={() => this.fetchData(recordID)}
        />
      </div>
    )
  }
}

const mapState = (state: IStore) => ({
  // auth
  authType: state['@global'].auth.authType,

  // ??????
  processRes: state['operation/appointProcess']
})

export default connect(mapState)(CounselingDetail)
