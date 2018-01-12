<!-- Trafford Data Lab markdown template for PDF output. -->

<!-- The CSS below should form our base style sheet and be placed in a separate file when finished which is then loaded in the dependancies section below. -->
<style>
body
{
    padding: 0;
    margin: 0;
}

h1, h2, h3, h4, h5, h6, .header
{
    font-family: 'Roboto', sans-serif;
    color: #757575;
}

a
{
    color: #fc6721;
    text-decoration: none;
}

a:hover
{
    text-decoration: underline;
}

.header
{
    background-color: white;
    text-align: left;
    border-bottom: 1px solid #757575;
    margin-bottom: 1em;
}

.homeBar
{
    display: inline-block;
    list-style-type: none;
    margin: 0;
    padding: 0;
    overflow: hidden;
}

.homeLogo
{
	float: left;
    padding: 6px 12px 0px 12px;
    margin: 5px 0px 0px 0px;
}

/* Style for lab logo including various IE specific versions due to mishandling of the SVG element */
.traffordDataLabLogo
{
    height:2em;
}

@media screen\0 {
    .traffordDataLabLogo { width: 93px; }
}

_:-ms-fullscreen, :root .traffordDataLabLogo { width: 93px; }
/* End of lab logo style */

.main
{
    font-family: 'Open Sans', sans-serif;
    color: #212121;
    margin: 30px 12px;
}

.main p
{
    line-height: 1.8em;
}

.main li
{
    line-height: 2em;
}

.footer
{
    font-family: 'Open Sans', sans-serif;
    color: #212121;
    width: 100%;
    margin: 0;
    padding: 0;
    background-color: #f0f0f0;
    overflow: hidden;
}

.leftFooter
{
    float: left;
    white-space: nowrap;
}

.rightFooter
{
	float:right;
    background-color:white;
}

.logoTrafford
{
	height: 5em;
}

.logoMedia
{
    font-size: 2em;
    padding: 0px 12px;
    margin: 0;
}

.linkMedia
{
    color: #212121;
    padding: 0px 10px 0px 0px;
}

.license
{
    font-size: 0.7em;
    padding: 10px 0px 0px 12px;
}
</style>

<!-- Start: overridden styles - These should be placed in a separate file when finished and then loaded in the dependancies section below. -->
<style>
.main
{
	margin-top: -30px;
}

.header
{
	margin-top: -16px;
}

.homeLogo
{
    padding-top: 0;
    margin-top: 0;
}

.traffordDataLabLogo
{
    height: 35px;
}

.pagebreak
{
	page-break-after: always;
}
</style>
<!-- End: overridden styles-->

<!-- Start: load dependancies -->
<!--link rel="stylesheet" href="https://trafforddatalab.github.io/assets/css/trafforddatalab_base.css"-->
<!--link rel="stylesheet" href="https://trafforddatalab.github.io/assets/css/trafforddatalab_markdown_to_pdf.css"-->
<link href="https://fonts.googleapis.com/css?family=Open+Sans|Roboto" rel="stylesheet">
<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css">
<!-- End: load dependancies -->

<!-- Start: repeatable header section -->
<div class="header">
<ul class="homeBar">
<li class="homeLogo"><a href="index.html"><img class="traffordDataLabLogo" src="https://trafforddatalab.github.io/assets/logo/trafforddatalab_logo.svg" alt="Trafford Data Lab" border="0"/></a></li>
</ul>
</div>
<br />
<div class="main">
<!-- End: repeatable header section -->

<!-- Start: markdown editable area -->

# This is a test
This is normal text This is normal text This is normal text This is normal text This is normal text This is normal text This is normal text This is normal text 

<!-- End: markdown editable area -->
</div>
<!-- Start: page break section -->
<div class="pagebreak"></div>
<!-- End: page break section -->

<!-- Start: repeatable header section -->
<div class="header">
<ul class="homeBar">
<li class="homeLogo"><a href="index.html"><img class="traffordDataLabLogo" src="https://trafforddatalab.github.io/assets/logo/trafforddatalab_logo.svg" alt="Trafford Data Lab" border="0"/></a></li>
</ul>
</div>
<br />
<div class="main">
<!-- End: repeatable header section -->

<!-- Start: markdown editable area -->

# This is a test
This is normal text This is normal text This is normal text This is normal text This is normal text This is normal text This is normal text This is normal text 

<!-- End: markdown editable area -->
</div>
<!-- Start: footer section -->
<div class="footer">
<div class="leftFooter">
<div class="logoMedia">
<a class="linkMedia" href="https://twitter.com/traffordDataLab"><i class="fa fa-twitter-square"></i></a>
<a class="linkMedia" href="https://github.com/traffordDataLab"><i class="fa fa-github"></i></a>
</div>
<div class="license">Released under <a class="footerLink" href="http://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/">Open Government Licence 3.0.</a></div>
</div>
<div class="rightFooter">
<a href="http://www.trafford.gov.uk"><img class="logoTrafford" src="https://trafforddatalab.github.io/images/trafford_council_logo_black_on_white_100px.png" alt="Trafford Council" border="0"></a>
</div>
</div>
<!-- End: footer section -->