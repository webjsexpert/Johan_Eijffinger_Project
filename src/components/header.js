import React, {Component} from 'react'
import * as authAction  from '../actions/authAction';
import { Dropdown } from 'react-bootstrap';
import { connect } from 'react-redux';
import history from '../history';
import * as Auth from '../factories/auth';
import $ from 'jquery';
import { Button } from 'react-bootstrap';
import { trls } from '../factories/translate';

const mapStateToProps = state => ({ 
    ...state.auth,
});
const mapDispatchToProps = (dispatch) => ({
    changeLan: (params) =>
        dispatch(authAction.changeLan(params)),
    setUserType: (param) =>
        dispatch(authAction.userType(param)),
});
class Header extends Component {
    constructor(props) {
        super(props);
        this.state = {
            roles:[{"value":"en_US","label":"English"},{"value":"nl_BE","label":"Dutch"},{"value":"de_DE","label":"German"},{"value":"fr_FR","label":"French"}],
            selectrolvalue:window.localStorage.getItem('eijf_lang'),
            selectrollabel:window.localStorage.getItem('eijf_label'),
            userInfo: Auth.getUserInfo(),
            userType: this.props.userType,
        };
    }

    componentWillReceiveProps = nextProps => {
        this.setState({
            userType: nextProps.userType
        });
    };

    componentDidMount () {
        $(".header__burger-btn").click(function() {
            $(".header__burger-btn").toggleClass("open")
            $(".sidebar").toggleClass("open")
        })
        $(".header__user").click(function() {
            $(".header__controls").toggleClass("open")
        })
    }
    logOut = () => {
        var removeFlag = Auth.removeAuth();
        if(removeFlag){
            history.push('/login')
        }
    }
    resetPassword = () => {
        // const { userInfo } = this.state;
        history.push('/forgot-password?loginUser=true')
    }
    changeLangauge = (val) => {
        this.setState({selectrolvalue:val.value, selectrollabel: val.label});
        this.props.changeLan(val)
    }
    goBackAdmin = () => {
        const info = Auth.getAdminInfo();
        window.localStorage.setItem('eijf_token', info.userToken);
        window.localStorage.setItem('eijf_userName', info.userName);
        window.localStorage.setItem('eijf_role', info.role);
        this.setState({userInfo : Auth.getUserInfo()});
        this.props.setUserType("admin");
    }
    render () {
        
        console.log("usertype-----",this.props.userType)
      return (
        <div>
            <header className="header">
                <div className="header__burger-btn">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
                <a href="/" className="header__logo-mob">
                    <img title="" className="Logo--mobile" alt="Eijffinger Nederland" src="https://www.eijffinger.com/Themes/Eijffinger/Content/images/logo--mobile.svg"/>
                </a>
                <div className="header__controls">
                        {/* <Select
                                name="lan"
                                options={this.state.roles}
                                className="select-lang-class"
                                value={{"label":this.state.selectrollabel,"value":this.state.selectrolvalue}}
                                onChange={val => this.changeLangauge(val)}
                            /> */}
                            {this.state.userType === "user" ? <Button variant="primary" onClick={()=>this.goBackAdmin()}>{trls('Go_Back_Admin')}</Button>
                            : '' }
                            
                            <Dropdown>
                                <Dropdown.Toggle variant="success" id="dropdown-basic" style={{color:"#000000"}}>
                                    Johan Boerema<img src={require("../assets/images/avatar.jpg")} alt="User avatar" className="header__user-dropdown-img"/> 
                                </Dropdown.Toggle>
                                <Dropdown.Menu style={{marginLeft:15}}>
                                    <Dropdown.Item onClick={this.logOut}>Logout</Dropdown.Item>
                                    <Dropdown.Item onClick={()=>this.resetPassword()}>Reset Password</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>

                </div>
                <div className="header__user">
                    <span className="header__user-name">
                    </span>
                    <img src={require("../assets/images/avatar.jpg")} alt="User avatar" className="header__user-img"/>
                </div>
            </header>
        </div>
      )
    };
  }
  export default connect(mapStateToProps, mapDispatchToProps)(Header);
