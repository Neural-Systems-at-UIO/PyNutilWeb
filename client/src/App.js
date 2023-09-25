import React, { useEffect, useState } from 'react';
import { Space, Transfer, Button, Tooltip, Spin, Popover} from 'antd';
import OptionsMenu from './OptionsMenu';
import TransferList from './TransferList';
import './App.css';
import getToken from './authenticationUtilities'

const Loading = () => {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Spin size='large' style={{ marginBottom: '6rem' }}>
        <h1 style={{ marginTop: '6rem' }}>Logging In</h1>
        <div className="content" />
      </Spin>
    </div>
  )
}

function ListBucketObjects(bucket, path) {
  return fetch(`https://data-proxy.ebrains.eu/api/v1/buckets/${bucket}?prefix=${path}&delimiter=%2F&limit=500`)
    .then(response => response.json())
    .catch(error => console.error(error));
}

function App() {
  const [loading, setLoading] = React.useState(true)
  const [token, setToken] = React.useState(null)
  const [pointPerObject, setPointPerObject] = useState(false);
  const [pointPerPixel, setPointPerPixel] = useState(false);
  const [minObjectSize, setMinObjectSize] = useState(0);
  const [targetKeys, setTargetKeys] = useState([]);
  const [targetAtlas, setTargetAtlas] = useState('');
  const [processedDataSource, setProcessedDataSource] = useState([]);
  const [bucketName, setBucketName] = useState('')
  const isButtonDisabled = targetKeys.length === 0 || (!pointPerObject && !pointPerPixel);
  useEffect(() => {
    let queryParameters = new URLSearchParams(window.location.search)
    console.log('Current URL:', window.location.href);
    console.log('env variables accessible', process.env)
    let temp_bucket_name = queryParameters.get('state')
    // convert temp_bucket_name to json
    temp_bucket_name = JSON.parse(temp_bucket_name)
    if (temp_bucket_name != null) {
      temp_bucket_name = temp_bucket_name['clb-collab-id']
    }

    setBucketName(temp_bucket_name)
    console.log( temp_bucket_name)
    console.log('rerender')
  }, [])

  const [dataSource, setDataSource] = useState([])

  // get bucket_name from url
  useEffect(() => {
    if (bucketName == '') {
      return
    }
    console.log('bucketName: ', bucketName)
    let data1 = ListBucketObjects(bucketName, '.nesysWorkflowFiles/alignmentJsons/')
    let data2 = ListBucketObjects(bucketName, '.nesysWorkflowFiles/ilastikOutputs/')

    Promise.all([data1, data2]).then(([result1, result2]) => {
      // remove all files from file1 that do not end in waln
      result1.objects = result1.objects.filter((file) => file.name.endsWith('.waln'))
      let files1 = result1.objects.map((file) => {
        // if name in file
        if (file.subdir) {
          file.name = file.subdir
        }
        file.name = file.name.replace('.waln', '')
        // remove path from name
        file.name = file.name.replace('.nesysWorkflowFiles/alignmentJsons/', '')
        file.name = file.name.replace('/', '')

        return file.name
      })

      let files2 = result2.objects.map((file) => {
        // if name in file
        if (file.subdir) {
          file.name = file.subdir
        }
        file.name = file.name.replace('.waln', '')
        // remove path from name
        file.name = file.name.replace('.nesysWorkflowFiles/ilastikOutputs/', '')
        file.name = file.name.replace('/', '')

        return file.name
      })

      // filter empty strings from both
      files1 = files1.filter((file) => file !== '')
      files2 = files2.filter((file) => file !== '')
    

      let tempDataSource = files1.map((file, index) => {
    
        if (files2.includes(file)) {
        return {
          key: index + 1,
          title: file,
          description: file,
          disabled: false,
          chosen: false,
        }
      }
      else {
        return {
          key: index + 1,
          title: file,
          description: file,
          disabled: true,
          chosen: false,
        }
      }
      })

      setDataSource(tempDataSource)
    })
  }, [bucketName])

  function handleTokenReceived(token) {
    // window.history.pushState({}, document.title, "/") // clear url 
    setToken(token)
    return token
  }
  function Authenticate() {
    // get the environment variable
    let oidc_redirect_uri = process.env.REACT_APP_OIDC_CLIENT_REDIRECT_URL;
    let oidc_client_id = process.env.REACT_APP_WORKBENCH_OIDC_CLIENT_ID;
    let state = {};
    let currentURL = window.location.href;
    for (let setting of currentURL.substring(currentURL.indexOf("?") + 1).split("&")) {
      let [key, value] = setting.split("=");
      state[key] = value;
    }
 
    let newURL = `https://iam.ebrains.eu/auth/realms/hbp/protocol/openid-connect/auth?response_type=code&login=true&client_id=${oidc_client_id}&redirect_uri=${oidc_redirect_uri}&state=${encodeURIComponent(
      JSON.stringify(state)
    )}`;
    console.log('newURL', newURL)
    window.location.href = newURL;
  }

  const onChange = (nextTargetKeys) => {
    console.log('targetKeys:', nextTargetKeys)
    setTargetKeys(nextTargetKeys);
  };

  const onClick = () => {
    let newProcessedDataSource = [];
    if (pointPerPixel) {
      let PPPDataSource = targetKeys.map(key => dataSource[parseInt(key) - 1]);
      PPPDataSource= PPPDataSource.map(obj => {
        return {
          key: obj.key,
          title: obj.title,
          description: obj.description,
          method: 'PPP',
          minObjectSize: '',
          status: 'queued',
          atlas: targetAtlas
        }
      })
      newProcessedDataSource = [...newProcessedDataSource, ...PPPDataSource];
    }
    if (pointPerObject) {
      let PPODataSource = targetKeys.map(key => dataSource[parseInt(key) - 1]);
      PPODataSource = PPODataSource.map(obj => {
        return {
          // add 99000 to key to differentiate from PPP
          key: obj.key + 99000,
          title: obj.title,
          description: obj.description,
          method: 'PPO',
          minObjectSize: minObjectSize,
          status: 'queued',
          atlas: targetAtlas
        }
      })
      newProcessedDataSource = [...newProcessedDataSource, ...PPODataSource];

    }

    
    
    setProcessedDataSource(processedDataSource => [...processedDataSource, ...newProcessedDataSource]);
    setTargetKeys([]);
    let brains = newProcessedDataSource.map(obj => obj.title).join(',');
    // remove duplicates
    brains = [...new Set(brains.split(','))].join(',')
    let oidc_redirect_uri = process.env.REACT_APP_OIDC_CLIENT_REDIRECT_URL;
    let url = `${oidc_redirect_uri}/process_brains?brains=${brains}&pointPerObject=${pointPerObject}&pointPerPixel=${pointPerPixel}&minObjectSize=${minObjectSize}&targetAtlas=${targetAtlas}&clb-collab-id=${bucketName}`
    console.log(url)
    fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `${token}`
      }
      })
      .catch(error => console.error(error));

  }
  


const ItemRenderer = ({ item }) => {
  const content = (
    <div style={{display:'flex', flexDirection:'column', gap:'0.5rem' }}>
      <Button onClick={
        (e) => {
          e.stopPropagation();

          openLocaliZoomHandler(item.title)
        }
      } >Atlas Overlay</Button>
      <Button onClick={
        (e) => {
          e.stopPropagation();
          openMioViewer(item.title)
        }
      }>Images Only</Button>
    </div>
  );
  const renderDisabledItem = () => (
    <Tooltip placement="left" title="This item is disabled for pyNutil since it doesn't have an associated segmentation from webIlastik. You can still open it in the viewer.">
      <span>{item.title}</span>
    </Tooltip>
  );

  const renderEnabledItem = () => (
    <>
    <span>{item.title}</span>



  
    </>
  )
  return (
    <div>
      {item.disabled ? renderDisabledItem() : renderEnabledItem()}
      <Popover
      content={content}
      trigger="click"
      placement="right">
                    <Button  size="small" style={{ float: 'right' }} onClick={e => { e.stopPropagation(); }}>Shareable Link</Button>
      </Popover>

    </div>
  );
};

  const openLocaliZoomHandler = (title) => {
    let localizoomUrl = "https://lz-nl.apps.hbp.eu/collab.php?clb-collab-id="
    localizoomUrl += bucketName
    localizoomUrl += "&filename=.nesysWorkflowFiles/alignmentJsons/"
    localizoomUrl += title
    localizoomUrl += ".waln"
    window.open(localizoomUrl, "_blank")
  }
  const openMioViewer = (title) => {
    let viewerUrl = "https://miosdv.apps-dev.hbp.eu/index.html?bucket=https://tar-svc-test.apps.hbp.eu/fakebucket/?url=https://data-proxy.ebrains.eu/api/v1/buckets/"
    viewerUrl += bucketName
    viewerUrl += "?prefix=.nesysWorkflowFiles/zippedPyramids/"
    viewerUrl += title
    window.open(viewerUrl, "_blank")
  }



  React.useEffect(() => {
    // console.log('useEffect')
    // only authenticate if we are not already authenticated
    if (!window.location.href.includes('code=')) {
      Authenticate()
      return
    }
    getToken()
      .then((token) => handleTokenReceived(token))
      .then(function (token) {
        console.log('token: ', token)
        setLoading(false)
      })
      .catch(error => console.error(error));
  }, [])

  if (loading) {
    return (
      <Loading />
    )
  }

  
  else {
    return (
      <div className="App">
        <header className="App-header"></header>
        <div className="center">
          <Space direction="vertical" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>

            <Space direction='horizontal' style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' ,  width:'100%' }}>
            <div  style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' ,  width:'100%', flexDirection:"column"  }}>
            {/* <Space direction='horizontal' id='column-headers' style={{ display: 'flex',  width:'100%'}}> */}
            <div style={{ display: 'flex', flexDirection: 'row', width:'100%'}}>
         
            <h2 style={{width:'100%',textAlign: 'center', left:0}}>Available Brains</h2>
            <h2 style={{width:'100%',textAlign: 'center'}}>Brains to Process</h2>
            </div>
            {/* </Space> */}
              <Transfer
                dataSource={dataSource}
                targetKeys={targetKeys}
                showSearch
                render={item => <ItemRenderer item={item} />}
                              listStyle={{ width: '20rem', height: 400 }}
                locale={{ itemUnit: 'brains', itemsUnit: 'brains', searchPlaceholder: 'Search brains' }}
                // titles={['Available Brains', 'Brains to Process']}
                onChange={onChange}

              />
                            </div>

              <TransferList
                processedDataSource={processedDataSource}
                bucketName={bucketName}
              />
            </Space>
            <div style={{display:'flex', width:'72.5rem',flexDirection:'column', alignItems:'center', backgroundColor:'#F9F6EE',  border: '2px solid black' , gap: '1rem', borderRadius: '10px', padding:'1rem'}}>
              <h2 style={{margin:0}}>Settings</h2>
            <OptionsMenu
              setMinObjectSize={setMinObjectSize}
              setPointPerObject={setPointPerObject}
              setPointPerPixel={setPointPerPixel}
              pointPerObject={pointPerObject}
              setTargetAtlas={setTargetAtlas}
            />
            <Space>
              {isButtonDisabled ? (
                <Tooltip placement="bottom" title="You must have brains in the 'Brains to process' menu and a point calculation method selected before proceeding" >
                  <span style={{ marginLeft: '8px' }}>
                    <Button type="primary" disabled={isButtonDisabled} size='large'>
                      Process Brains
                    </Button>
                  </span>
                </Tooltip>
              ) : (
                <Button type="primary" onClick={onClick}>
                  Process Brains
                </Button>
              )}
            </Space>
            </div>
          </Space>
        </div>
      </div>
    );
  }
}

export default App;



