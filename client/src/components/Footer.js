import React from "react";
import "./CSS/Footer.css";
import logo from "./Images/N_L_W.svg";

function Footer(){

    const year = new Date().getFullYear();
    
    return (
        <footer className="footer">
            <div className="foot-left">
                <div className="footer-left-Logo">
                        <img src={logo} alt="Logo" className="footer-left-img"/>    
                    </div>
                <p className="footer-left-desc">EyeCare Consult is your comprehensive platform for all eye care needs. Connect with top eye specialists, book online appointments, access personalized eye exercises, and order medicines and eyewear. Utilize our advanced scan reader for detailed eye health reports and enhance your vision health with expert advice, all from the comfort of your home.</p>
            </div>
            
            <div class="vertical-line"></div> 
            <div className="footer-right">
                <div className="footer-right-cont">
                    <h1>Contact Us</h1>
                    <p>Email: Support@eyecare.com</p>
                    <p>Phone no: 0900-78601</p>  
                    <p>Address: Head office, Islamabad, Pakistan </p>  
                </div>

                <div className="footer-right-cr">
                    <p>Copyright ⓒ {year}</p>
                </div>


            </div>

        </footer>
    );
}

export default Footer;