import React, {Component} from 'react'
import { connect } from 'react-redux';
import { trls } from '../../factories/translate';
import { Container, Row, Col, Button, Form } from 'react-bootstrap';
// import SessionManager from '../../components/session_manage';
import Select from 'react-select';
import API from '../../factories/api'
import * as Common from '../../factories/common';
import Axios from 'axios';
import * as Auth from '../../factories/auth'
// import  { Link } from 'react-router-dom';
// import * as authAction  from '../../actions/authAction';
// import Slider from 'react-bootstrap-slider';
// import "bootstrap-slider/dist/css/bootstrap-slider.css"
import SessionManager from '../../factories/session_manage';
import $ from 'jquery';
import { BallBeat } from 'react-pure-loaders';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import 'datatables.net';
import Productsearchform from './product_searchform';
import Resumeform from './resume_form';
// import history from '../../history';
import Pageloadspiiner from '../../components/page_load_spinner';

const mapStateToProps = state => ({ 
    ...state.auth,
});

const mapDispatchToProps = (dispatch) => ({

});

class Placemanage extends Component {
    _isMounted = false;
    constructor(props) {
        super(props);
        this.state = {  
            rows: [],
            businessPartnerOption: [],
            shippingAddressOption: [],
            itemData: [],
            itemCode: '',
            itemQuantity: 0,
            itemPriceData: [],
            itemQuantityData: [],
            itemProductCodeData: [],
            pageLodingFlag: false,
            productDesription: '',
            itemPrice: '',
            quantity: '',
            unit: '',
            billAddress: [],
            shippingAddress: [],
            setSippingAddress: [],
            productSearch: [{'value': '7745-2', 'label': '7745-2'}, {'value': '7745-2', 'label': '7745-2'}],
            userInfo: Auth.getUserInfo(), 
            rowId: 0
        };
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    componentDidMount() {
        this.getCustomerData();
    }

    getCustomerData = () => {
        this._isMounted = true;
        let params = {};
        var headers = SessionManager.shared().getAuthorizationHeader();
        Axios.post(API.GetCustomerData, params, headers)
        .then(result => {
            if(this._isMounted){
                if(result.data.value.length){
                    // let businessPartner = result.data.value.map( s => ({value:s.CardCode,label:s.CardName}));
                    let addressData = this.getShippingAddressOptionData(result.data.value);
                    let shippingData = addressData[1].map( s => ({value:s.BPCode,label:s.AddressName+" "+s.Street+" "+s.City+" "+s.Country}));
                    this.setState({businessPartnerOption: result.data.value, shippingAddressOption: shippingData, billAddress: addressData[0][0], shippingAddress: addressData[1]});
                }
            }
        });
    }

    getShippingAddressOptionData = (optionData) => {
        let returnOptionData = [];
        let billAddress = [];
        let shippingAddress = [];
        // let shippingAddress = data.BPAddresses.filter(item => item.AddressName==="Ship To");
        optionData.map((data, index)=>{
            data.BPAddresses.map((bpAddress, key)=>{
                if(bpAddress.AddressName==="Bill to"){
                    billAddress.push(bpAddress);
                }else if(bpAddress.AddressName==="Ship To"){
                    shippingAddress.push(bpAddress)
                }
                return bpAddress;
            })
            return data;
        });
        returnOptionData[0] = billAddress;
        returnOptionData[1] = shippingAddress;
        return returnOptionData;
    }
    
    handleAddRow = () => {
        let rowId = this.state.rowId;
        const item = {
          rowId: rowId
        };
        rowId += 1;
        this.setState({
            rows: [...this.state.rows, item],
            rowId: rowId
        });
        this.setState({addnum:true});
      };

    changeProductList = (evt) => {
        this.setState({productDesription: evt.target.value, itemPrice: 120, unit: 'unit'})
    }

    getItemData = (itemCode, rowId) => {
        this._isMounted = true;
        let itemData = this.state.itemData;
        this.setState({itemCode: itemCode, pageLodingFlag: true});
        var settings = {
            "url": API.GetItemData+itemCode,
            "method": "GET",
            "headers": {
                "Content-Type": "application/json",
                "Authorization": "Bearer "+Auth.getUserToken(),
        }
        }
        $.ajax(settings).done(function (response) {
        })
        .then(response => {
           itemData[rowId] = response
            this.setState({itemData: itemData, pageLodingFlag: false});
        });
    }

    getItemPriceData = (value, rowId, productCode) => {
        this._isMounted = true;
        let itemPriceData = this.state.itemPriceData;
        let itemQuantityData = this.state.itemQuantityData;
        itemQuantityData[rowId] = value;
        itemPriceData[rowId] = '';
        this.setState({itemPriceData: itemPriceData, pageLodingFlag: true, itemQuantityData: itemQuantityData});
        let params = {
            "itemCode": productCode,
            "quantity": value ? value : 0,
            "date": Common.formatDate1(new Date()),
            "orderType": "B2B"
        };
        var headers = SessionManager.shared().getAuthorizationHeader();
        Axios.post(API.GetDiscountPrice, params, headers)
        .then(result => {
            if(this._isMounted){
                if(result.data){
                    itemPriceData[rowId] = result.data;
                    itemPriceData[rowId].itemQuantity = parseFloat(value);
                    this.setState({itemPriceData: itemPriceData, pageLodingFlag: false})                    
                }
            }
        });
    }

    changeProductCode = (itemCode, rowId) => {
        let itemProductCodeData = this.state.itemProductCodeData;
        itemProductCodeData[rowId] = itemCode;
        this.setState({itemProductCodeData: itemProductCodeData})
    }

    changeQuantityData = (quantity, rowId) => {
        let itemQuantityData = this.state.itemQuantityData;
        itemQuantityData[rowId] = quantity;
        this.setState({itemQuantityData: itemQuantityData})
    }

    changeShippigAddress = (data) =>{
        const { shippingAddress } = this.state;
        
        let setSippingAddress = shippingAddress.filter(item => item.BPCode===data.value);
        if(setSippingAddress){
            this.setState({setSippingAddress: setSippingAddress[0]})
        }
        
    }

    removeOrderRow = (rowId) => {
        const { rows } = this.state;
        let rowsArr = rows.filter((item, key) => item.rowId !== rowId);
        this.setState({
            rows: rowsArr,
        });
    }

    render(){   
        let totalAmount = 0;
        const { businessPartnerOption, 
            shippingAddressOption, 
            itemData, itemPriceData, 
            pageLodingFlag, 
            userInfo, 
            billAddress, 
            setSippingAddress,
            itemQuantityData,
            itemProductCodeData,
            rows,
         } = this.state;
        if(itemPriceData){
            rows.map((data, key)=>{
                totalAmount +=  itemPriceData[data.rowId] ? itemPriceData[data.rowId].NewUnitPrice*itemPriceData[data.rowId].itemQuantity : 0;
                return data
            })
        }
        return (
            <div className="order_div">
                <div className="content__header content__header--with-line">
                    <div id="google_translate_element"></div>
                    <h2 className="title">{trls("Place_an_order")}</h2>
                </div>
                <Container>
                    <Form className="container product-form" onSubmit = { this.handleSubmit }>
                        <Row className="order__info-bill">
                            <Col sm={4} style={{paddingLeft: 0, paddingTop: 10}}>
                                    <Form.Group as={Row} controlId="formPlaintextPassword">
                                        <Form.Label column sm="4">
                                            {trls("Customer_reference")}  
                                        </Form.Label>
                                        <Col sm="8" className="product-text">
                                            <Form.Control type="text" name="reference" required placeholder={trls('Customer_reference')} />
                                        </Col>
                                    </Form.Group>
                                    <Form.Group as={Row} controlId="formPlaintextPassword">
                                        <Form.Label column sm="4">
                                            {trls("Business_partner")}  
                                        </Form.Label>
                                        {/* <Col sm="8" className="product-text">
                                            <Select
                                                name="usinesspartner"
                                                placeholder={trls('Business_partner')}
                                                options={businessPartnerOption}
                                                onChange={val => this.setState({val1:val})}
                                                // defaultValue = {this.getSupplierData()}
                                            />
                                        </Col> */}
                                        <Col sm="8" className="product-text">
                                            <Form.Control type="text" name="reference" required defaultValue = {businessPartnerOption[0] ? businessPartnerOption[0].CardName : ''} readOnly placeholder={trls('Customer_reference')} />
                                        </Col>
                                    </Form.Group>
                                    <Form.Group as={Row} controlId="formPlaintextPassword">
                                        <Form.Label column sm="4">
                                            {trls("Contact")}  
                                        </Form.Label>
                                        <Col sm="8" className="product-text">
                                            <Form.Control type="text" name="contact" defaultValue = {userInfo.userName} required placeholder={trls('Contact')} />
                                        </Col>
                                    </Form.Group>
                            </Col>
                            <Col sm={4} style={{paddingLeft: 0, paddingTop: 10}}>
                                <Form.Group as={Row} controlId="formPlaintextPassword">
                                    <Form.Label column sm="4">
                                        {trls("Shipping_Address")}  
                                    </Form.Label>
                                    <Col sm="8" className="product-text">
                                        <Select
                                            name="usinesspartner"
                                            placeholder={trls('Shipping_Address')}
                                            options={shippingAddressOption}
                                            onChange={val => this.changeShippigAddress(val)}
                                            // defaultValue = {this.getSupplierData()}
                                        />
                                    </Col>
                                </Form.Group>
                            </Col> 
                            <Col sm={4} className="bill-shipping__address" style={{paddingLeft: 0, paddingTop: 10}}>
                                <div>
                                    <p className="address-header">{trls('Billing_Address')}</p>
                                    <p>{billAddress.City ? billAddress.City : ''}</p>
                                    <p>{billAddress.City ? billAddress.Street + " " + billAddress.ZipCode : ''}</p>
                                    <p>{billAddress.Country ? billAddress.Country : ''}</p>
                                </div>
                                <div>
                                    <p className="address-header">{trls('Shipping_Address')}</p>
                                    <p>{setSippingAddress.City ? setSippingAddress.City : ''}</p>
                                    <p>{setSippingAddress.City ? setSippingAddress.Street + " " + setSippingAddress.ZipCode : ''}</p>
                                    <p>{setSippingAddress.Country ? setSippingAddress.Country : ''}</p>
                                </div>
                            </Col>
                        </Row>                   
                    </Form>
                    {/* <div className="table-responsive"> */}
                        <table id="example" className="place-and-orders__table table table--striped prurprice-dataTable" width="100%">
                        <thead>
                            <tr>
                                <th>{trls("Product_code")}</th>
                                <th>{trls("Product_description")}</th>
                                <th>{trls("Unit")}</th>
                                <th>{trls("Quantity")}</th>
                                <th>{trls("Price")}</th>
                                <th>{trls("Amount")}</th>
                                <th>{trls("Image")}</th>
                                <th>{trls("Customer_reference")}</th>
                                <th>{trls("Expected_deliver_week")}</th>
                                <th>{trls("Action")}</th>
                            </tr>
                        </thead>
                        {rows &&(<tbody>
                            {
                                rows.map((data,index) =>(
                                <tr id={index} key={index}>
                                    <td>
                                        <Row style={{justifyContent: "space-around"}}>
                                            <Form.Control type="text" name="productcode" style={{width: '80%'}} required placeholder={trls('Product_code')} value={itemProductCodeData[data.rowId] ? itemProductCodeData[data.rowId] : ''} onChange={(evt)=>this.changeProductCode(evt.target.value, data.rowId)} /><i className="fas fa-fist-raised add-icon" style={{marginTop: 10}} onClick={()=>this.getItemData(itemProductCodeData[data.rowId], data.rowId)}></i>
                                        </Row>
                                    </td>
                                    <td>
                                        <Form.Control type="text" name="description" readOnly required  defaultValue = {itemData[data.rowId] ? itemData[data.rowId].ItemName : ''} placeholder={trls('Description')} />
                                    </td>
                                    <td>
                                        {itemData[data.rowId] ? itemData[data.rowId].SalesUnit : ''}
                                    </td>
                                    <td>
                                        <Row style={{justifyContent: "space-around"}}>
                                            <Form.Control type="text" name="quantity" style={{width: '80%'}} required placeholder={trls('Quantity')} value={itemQuantityData[data.rowId] ? itemQuantityData[data.rowId] : ''} onChange={(evt)=>this.changeQuantityData(evt.target.value, data.rowId)} /><i className="fas fa-fist-raised add-icon" style={{marginTop: 10}} onClick={()=>this.getItemPriceData(itemQuantityData[data.rowId], data.rowId, itemProductCodeData[data.rowId])}></i>
                                        </Row>
                                    </td>
                                    <td>
                                        {Common.formatMoney(itemPriceData[data.rowId] ? itemPriceData[data.rowId].NewUnitPrice : '')}
                                    </td>
                                    <td>
                                        {Common.formatMoney(itemPriceData[data.rowId] ? itemPriceData[data.rowId].NewUnitPrice*itemPriceData[data.rowId].itemQuantity : '')}
                                    </td>   
                                    <td>
                                        <img src={ itemData[data.rowId] ? "data:image/png;base64," + itemData[data.rowId].Image : ''} alt={ itemData[data.rowId] ? data.rowId : ''} className = "image__zoom"></img>
                                    </td>
                                    <td>
                                        <Form.Control type="text" name="customerReference" required placeholder={trls('Customer_reference')} onChange={(evt)=>this.setState({quantity: evt.target.value})} />
                                    </td>
                                    <td>
                                        {this.state.productDesription&&(
                                            <DatePicker name="startdate" className="myDatePicker" dateFormat="dd-MM-yyyy" selected={new Date()} onChange={date =>this.setState({startdate:date})} />
                                        )}
                                    </td>
                                    <td>
                                        <Row style={{justifyContent: "space-around"}}>
                                            <i className="fas fa-trash-alt add-icon" onClick = {()=>this.removeOrderRow(data.rowId) }></i>
                                        </Row>
                                    </td>
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
                {/* </div> */}
                <div>
                    <Button variant="primary" onClick={()=>this.handleAddRow()}><i className="fas fa-plus add-icon"></i>{trls('Click_to_make_new_row')}</Button> 
                </div>
                <Col sm={4} style={{float: 'right', paddingLeft: 0, paddingRight: 0}}>
                    <div className="info-block info-block--green">
                        <span className="txt-bold">Order Total</span>
                        <span>{Common.formatMoney(totalAmount)}</span>
                    </div>
                    <Button variant="primary" style={{float: 'right'}} onClick={()=>this.setState({modalResumeShow: true})}>{trls('Submit_Order')}</Button>
                </Col>
            </Container>
            {/* <Productsearchform
                show={this.state.modaladdShow}
                onHide={() => this.setState({modaladdShow: false})}
            />
            <Resumeform
                show={this.state.modalResumeShow}
                onHide={() => this.setState({modalResumeShow: false})}
            /> */}
            <Pageloadspiiner loading = {pageLodingFlag}/>
        </div>
        );
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(Placemanage);