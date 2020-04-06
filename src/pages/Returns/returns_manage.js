import React, {Component} from 'react'
import { connect } from 'react-redux';
import { trls } from '../../factories/translate';
import { Row, Col, Button, Form } from 'react-bootstrap';
import SessionManager from '../../factories/session_manage';
// import Select from 'react-select';
import API from '../../factories/api'
import Axios from 'axios';
// import * as Auth from '../../factories/auth'
// import  { Link } from 'react-router-dom';
// import * as authAction  from '../../actions/authAction';
// import Slider from 'react-bootstrap-slider';
// import "bootstrap-slider/dist/css/bootstrap-slider.css"
import $ from 'jquery';
import { BallBeat } from 'react-pure-loaders';
// import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import 'datatables.net';
import history from '../../history';
import * as Common from '../../factories/common';
import Filtercomponent from '../../components/filtercomponent';

const mapStateToProps = state => ({ 
    ...state.auth,
});

const mapDispatchToProps = (dispatch) => ({

});

class Deliveriesmanage extends Component {
    _isMounted = false;
    constructor(props) {
        super(props);
        this.state = {  
            loading: false,
            deliveriesData: [],
            originFilterData: [],
            filterColunm: [
                {"label": trls('ItemCode'), "value": "ItemCode", "type": 'text', "show": true},
                {"label": trls('ItemDescription'), "value": "ItemDescription", "type": 'text', "show": true},
                {"label": trls('Quantity'), "value": "Quantity", "type": 'text', "show": true},
                {"label": trls('DocDate'), "value": "DocDate", "type": 'date', "show": true},
                {"label": trls('Price'), "value": "Price", "type": 'text', "show": true},
                {"label": trls('Amount'), "value": "Amount", "type": 'text', "show": true},
            ]
        };
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    componentDidMount() {
        this.getDeliveriesData();
    }

    getDeliveriesData = (data) => {
        this._isMounted = true;
        this.setState({loading:true})
        let params = {};
        var headers = SessionManager.shared().getAuthorizationHeader();
        Axios.post(API.GetReturnsData, params, headers)
        .then(result => {
            if(this._isMounted){
                if(result.data.value.length){
                    let deliveriesDataList = this.setDeliveriesData(result.data.value);
                    if(!data){
                        this.setState({deliveriesData: deliveriesDataList, originFilterData: deliveriesDataList});
                    }else{
                        this.setState({ordersData: data});
                    }
                    this.setState({loading:false});
                    $('.fitler').on( 'keyup', function () {
                        table.search( this.value ).draw();
                    } );
                    $('#deliver-table').dataTable().fnDestroy();
                    var table = $('#deliver-table').DataTable(
                        {
                            "language": {
                                "lengthMenu": trls("Show")+" _MENU_ "+trls("Result_on_page"),
                                "zeroRecords": "Nothing found - sorry",
                                "info": trls("Show_page")+" _PAGE_ "+trls('Results_of')+" _PAGES_",
                                "infoEmpty": "No records available",
                                "infoFiltered": "(filtered from _MAX_ total records)",
                                "search": trls('Search'),
                                "paginate": {
                                  "previous": trls('Previous'),
                                  "next": trls('Next')
                                }
                            },
                              "dom": 't<"bottom-datatable" lip>'
                          }
                      );
                }
            }
        });
    }

    setDeliveriesData = (deliveriesData) => {
        let returnDeliveriesData = [];
        let documentLineData = [];
        deliveriesData.map((data, index)=>{
            data.DocumentLines.map((documentLine, key)=>{
                documentLineData = documentLine;
                documentLineData.DocDate = data.DocDate;
                documentLineData.CardName = data.CardName;
                documentLineData.DocNum = data.DocNum;
                returnDeliveriesData.push(documentLineData);
                return documentLine;
            })
            return data;
        });
        return returnDeliveriesData;
    }

    showOrderDetail = (orderId) => {
        history.push({
            pathname: '/order-detail/'+orderId,
            state: { id: orderId, newSubmit:true }
          })
    }

    removeColumn = (value) => {
        let filterColunm = this.state.filterColunm;
        filterColunm = filterColunm.filter(function(item, key) {
            if(item.label===value){
            item.show = false;
            }
            return item;
        })
        this.setState({filterColunm: filterColunm})
    }

    showColumn = (value) => {
        let filterColum = this.state.filterColunm;
        filterColum = filterColum.filter((item, key)=>item.label===value);
        return filterColum[0].show;
    }

    // filter module
    filterOptionData = (filterOption) =>{
        let dataA = []
        dataA = Common.filterData(filterOption, this.state.originFilterData);
        if(!filterOption.length){
            dataA=null;
        }
        this.getOrdersData(dataA);
    }

    changeFilter = () => {
        if(this.state.filterFlag){
            this.setState({filterFlag: false})
        }else{
            this.setState({filterFlag: true})
        }
    }
    // filter module
    
    render(){   
        const {filterColunm, deliveriesData} = this.state;
        return (
            <div className="order_div">
                <div className="content__header content__header--with-line">
                    <div id="google_translate_element"></div>
                    <h2 className="title">{trls("Returns")}</h2>
                </div>
                <div className="orders">
                    <Row>
                        <Col sm={6}>
                            {/* <Button variant="primary" onClick={()=>this.addUser()}><i className="fas fa-plus add-icon"></i>{trls('Add_order')}</Button>  */}
                        </Col>
                        <Col sm={6} className="has-search">
                            <div style={{display: 'flex', float: 'right'}}>
                                <Button variant="light" onClick={()=>this.changeFilter()}><i className="fas fa-filter add-icon"></i>{trls('Filter')}</Button>
                                <div style={{marginLeft: 20}}>
                                    <span className="fa fa-search form-control-feedback"></span>
                                    <Form.Control className="form-control fitler" type="text" name="number"placeholder={trls("Quick_search")}/>
                                </div>
                            </div>
                        </Col>
                        {filterColunm.length&&(
                            <Filtercomponent
                                onHide={()=>this.setState({filterFlag: false})}
                                filterData={filterColunm}
                                onFilterData={(filterOption)=>this.filterOptionData(filterOption)}
                                showFlag={this.state.filterFlag}
                            />
                        )}
                    </Row>
                    <div className="table-responsive credit-history">
                        <table id="deliver-table" className="place-and-orders__table table" width="100%">
                        <thead>
                            <tr>
                                {filterColunm.map((item, key)=>(
                                    <th className={!item.show ? "filter-show__hide" : ''} key={key}>
                                       {item.label}
                                        {/* <Contextmenu
                                            triggerTitle = {item.label}
                                            addFilterColumn = {(value)=>this.addFilterColumn(value)}
                                            removeColumn = {(value)=>this.removeColumn(value)}
                                        /> */}
                                    </th>
                                    )
                                )}
                            </tr>
                        </thead>
                        {deliveriesData && !this.state.loading &&(<tbody >
                            {
                                deliveriesData.map((data,i) =>(
                                    <tr id={i} key={i}>
                                        <td className={!this.showColumn(filterColunm[0].label) ? "filter-show__hide" : ''}>{data.ItemCode}</td>
                                        <td className={!this.showColumn(filterColunm[1].label) ? "filter-show__hide" : ''}>{data.ItemDescription}</td>
                                        <td className={!this.showColumn(filterColunm[2].label) ? "filter-show__hide" : ''}>{data.Quantity}</td>
                                        <td className={!this.showColumn(filterColunm[3].label) ? "filter-show__hide" : ''}>{Common.formatDate(data.DocDate)}</td>
                                        <td className={!this.showColumn(filterColunm[4].label) ? "filter-show__hide" : ''}>{data.Price}</td>
                                        <td className={!this.showColumn(filterColunm[5].label) ? "filter-show__hide" : ''}>{data.Amount}</td>
                                    </tr>
                                ))
                            }
                        </tbody>)}
                    </table>
                        { this.state.loading&& (
                            <div className="col-md-4 offset-md-4 col-xs-12 loading" style={{textAlign:"center"}}>
                                <BallBeat
                                    color={'#222A42'}
                                    loading={this.state.loading}
                                />
                            </div>
                        )}
                    </div>
                    {/* {this.state.slideFormFlag ? (
                        <Adduserform
                            show={this.state.modalShow}
                            mode={this.state.mode}
                            onHide={() => this.setState({slideFormFlag: false})}
                            onGetUser={() => this.getUserData()}
                            userUpdateData={this.state.userUpdateData}
                            userID={this.state.userID}
                        /> 
                    ): null} */}
                </div>
            </div>
        );
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(Deliveriesmanage);