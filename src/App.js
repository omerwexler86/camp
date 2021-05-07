import './App.css';
import React, {useEffect, useState} from 'react';
import Amplify, {API, Auth} from 'aws-amplify';
import config from './aws-exports';
import { AmplifyAuthenticator, AmplifySignOut, AmplifySignUp, AmplifySignIn } from '@aws-amplify/ui-react';
import Form from './Form';
import Table from './PopulateTable';
import PropTypes from 'prop-types';
import SwipeableViews from 'react-swipeable-views';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';



Amplify.configure(config);
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={2}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};


function a11yProps(index) {
  return {
    id: `full-width-tab-${index}`,
    'aria-controls': `full-width-tabpanel-${index}`,
  };
}

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.paper,
    width: 500,
  },
}));

function App(props) {
  const [email, setEmail] = useState("");
  const [campdata, setCampdata] = useState();
  const classes = useStyles();
  const theme = useTheme();
  const [value, setValue] = React.useState(0);
  const [childData, setChildData] = useState([]);
  const [clicked, setClicked] = React.useState(0);
  const [message, setMessage] = React.useState("");
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleChangeIndex = (index) => {
    setValue(index);
  };
  
  useEffect(() =>{
    setMessage("");
    if(value==0){
      return;
    }
    setClicked(0);
    setCampdata(null);
    Auth.currentSession()
      .then((data) => {
        setEmail(data.idToken.payload.email);
        API.get('campv2api', '/camp/'+ data.idToken.payload.email)
          .then(async(campRes) => {
            if(campRes.size == undefined || campRes.size == 0){
              setMessage("Empty! Please submit a form first");
              console.log("Empty! Please submit a form first")
            }else{
              setCampdata(campRes);
            }
          })
          .catch(error => {
            console.log(error);
          });
      })
      .catch(err => console.log(err));
  },[value])
  return (
    <AmplifyAuthenticator>
      <AmplifySignUp
        slot="sign-up"
        usernameAlias="email"
      />
      <AmplifySignIn
        slot="sign-in"
        usernameAlias="email"
      />
      <div className={classes.root} className = "App">
        <h2>Welcome!</h2>
        <h3> Please use form to store campsite information<br/> Then, click on TABLE tab to check real-time campsite availability</h3>
        <div className = "Content">
        <AppBar position="static" color="default">
          <Tabs
            value={value}
            onChange={handleChange}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
            aria-label="full width tabs example"
          >
            <Tab label="Form" {...a11yProps(0)} />
            <Tab label={"Table"} {...a11yProps(1)} />
          </Tabs>
        </AppBar>
        <SwipeableViews
          axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
          index={value}
          onChangeIndex={handleChangeIndex}
        >
          <TabPanel value={value} index={0} dir={theme.direction}>
            {clicked > 0 ?<div className="alert">
              <span onclick={setTimeout(()=>{setClicked(0)},2000)}></span> 
              <strong>Success!</strong> Form has been submitted. Check Table tab.
            </div>: <></>}
            <Form email={email} click={clicked} passChildData = {setClicked}/>
          </TabPanel>
          <TabPanel value={value} index={1} dir={theme.direction} >
            {!campdata && <h2>{message}</h2>}
            {campdata && <Table data = {campdata} email={email}/>}
          </TabPanel>
          <span class="badge">{clicked}</span>
        </SwipeableViews>
        <AmplifySignOut/>
        </div>
      </div>
    </AmplifyAuthenticator>
  );
}
export default App;
