const getLoginOTPVerificationBody = ({ otp, firstName, lastName }) => {
  return `<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8" />
        <title>Untitled Document</title>
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@500;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Gelasio:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&display=swap" rel="stylesheet">
        <style>
        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css" />
        <script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js"></script>
        <script src="https://kit.fontawesome.com/1380329a16.js" crossorigin="anonymous"></script>

            body {
                font-family: "Montserrat", sans-serif;
                font-size: 14px;
            }
            a {
                text-decoration: none !important;
            }
            h1,
            h2,
            h3,
            h4,
            h5 {
                font-weight: 700;
                 font-family: "Gelasio", serif;
                  font-style: italic;
                  
            }
            h4 {
                font-size: 36px;
            }
             div {
                font-size: 23px;
                 font-family: "Montserrat", sans-serif;
            }
            .p-3 {
                padding: 0 30px;
            }
            p {
                font-family: "Montserrat", sans-serif;
                line-height: 28px;
                margin-bottom: 15px;
                color: #666;
            }
            .red-text {
                color: #d73d34;
            }
            .black-text {
                color: #000;
            }
            [class^="hvr-"] {
                margin: 0;
                margin-bottom: 10px;
                padding: 0.7em;
                cursor: pointer;
                background: #e1e1e1;
                text-decoration: none;
                color: #fff;
                -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
                -webkit-font-smoothing: antialiased;
                -moz-osx-font-smoothing: grayscale;
                border-radius: 30px;
            }
            .btn3 {
                background-color: #046f37;
                color: #fff;
                border: 1px solid #046f37 !important;
                text-transform: uppercase;
                font-weight: bold;
                padding: 5px 8px;
                display: inline-block;
                transition: all 300ms ease;
                margin: 10px;
                margin-bottom: 30px;
                margin-left: 0;
            }
            .btn3:hover {
                background-color: #292a2d;
                color: #fff;
            }
            .small-t {
                font-size: 12px;
                line-height: 15px;
            }
            .red-text {
                color: #046f37;
            }
        </style>
    </head>

    <body style="background: #fff; text-align: center;">
        <table width="420px" style="background: #134c49; margin: 0 auto; border: 2px solid #efefef; border-top: 0; border-bottom: 0;" cellpadding="18">
            <tr>
                <td style="text-align: center;">
                   
                     <img src="${base_url}public/logo/graces-logo.jpg"  type="image/png" style="width:130px " alt="logo" />
                   
                    <p>&nbsp;</p>
                    <h4 style="margin-top:10px; color:#fff">Secure Your Login</h4>
                </td>
            </tr>

            <tr >
                <td >
                    <table width="380px" style="background: #fff; margin: 0 auto; border: 2px solid #efefef; text-align: left; " cellpadding="18">
                        <tr>
                            <td>
                                <p>
                                 Hello ${firstName} ${lastName},
                                </p>
                                <p>
                                You've initiated a login attempt on TribeBond. To ensure the security of your account, please enter the following One-Time Password (OTP) to complete the login process:
                                </p>
                            </td>
                        </tr>

                        <tr>
                            <td>
                                <table width="380px" style="background: #fff; margin: 0 auto; border: 2px solid #efefef; text-align: left;" cellpadding="18">
                                    <tr>
                                        <td>
                                            <p><strong className="red-text">Account Details</strong></p>
                                            <hr />
                                            <p>
                                                One Time Password: ${otp}
                                            </p>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>

                        <tr>
                            <td align="center">
                                <hr />
                                <p className="small-t">
                                    Problems or questions? Email us at <br /> info@tribebond.com <br />
                                    <br />
                                    &copy; TribeBond <br />
                                  Village Konajheer, Sehore Ichhawar Road, District Sehore, Adjacent To Bhopal - Indore Highway, Bhopal, Madhya Pradesh 466001<br />
                                </p>
                                <br />

                                <p className="small-t black-text">[This is an auto-generated mail. Please do not reply.]</p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
</html>`;
};

module.exports = { getLoginOTPVerificationBody };
