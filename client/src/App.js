import React, { useEffect, useState } from 'react';
import { Space, Transfer, Button, Tooltip, Spin, Popover, Modal,Progress, List} from 'antd';
import OptionsMenu from './OptionsMenu';
import TransferList from './TransferList';
import './App.css';
import io from 'socket.io-client';

import getToken from './authenticationUtilities'
const { v4: uuidv4 } = require('uuid');

const socket = io(process.env.REACT_APP_OIDC_CLIENT_REDIRECT_URL);

socket.on('connect', () => {
  console.log('Connected to server');
});




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

      // now set all targets
      let finishedBrains = ListBucketObjects(bucketName, '.nesysWorkflowFiles/pointClouds/')
      let newProcessedDataSource = [];
      finishedBrains.then((result) => {
        for (let dir of result.objects) {
          console.log('dir', dir)
          if (dir.subdir) {
          let subdir = ListBucketObjects(bucketName, dir.subdir);
          let data_title = dir.subdir.replace('.nesysWorkflowFiles/pointClouds/', '')
          // remove the last element
          data_title = data_title.substring(0, data_title.length - 1)
          subdir.then((secondResult) => {
            console.log('secondResult', secondResult)
            for (let file of secondResult.objects) {

            if (file.subdir) {
              let subsubdir = ListBucketObjects(bucketName, file.subdir);
              subsubdir.then((thirdResult) => {
                for (let subfile of thirdResult.objects) {
                  if (subfile.subdir) {
                    console.log('subfile', subfile)
                    let path_info = subfile.subdir.split('/')
                    // get the second last element
                    let atlas = path_info[path_info.length - 2]
                    let method = path_info[path_info.length - 3]
                    let update = {}
                    if (method == "per_pixel") {
                      // key should be random uuid
                      
                      update = {
                            key: `${data_title}_${atlas}_PPP`,
                            title: data_title,
                            description: "placeholder",
                            method: 'PPP',
                            minObjectSize: '',
                            status: 'completed',
                            atlas: atlas
                          }
                        }
                    else {
                      let minObjectSize = method.split('_').pop()
                      // remove the last 2 elements
                      minObjectSize = minObjectSize.substring(0, minObjectSize.length - 2)
                      update = {
                        key: `${data_title}_${atlas}_PPO_${minObjectSize}`,
                        title: data_title,
                        description: "placeholder",
                        method: 'PPO',
                        minObjectSize: minObjectSize,
                        status: 'completed',
                        atlas: atlas
                      }
                    }
                    newProcessedDataSource = [...newProcessedDataSource, update];
                    // remove duplicate keys
            
                    setProcessedDataSource(newProcessedDataSource)
                  }
                }
              });
            }
          }
          });
        }
        }
      });

    })
                  // if (file.subdir === ".nesysWorkflowFiles/pointClouds/per_pixel") {
              //   let update = {
              //     key: data_title,
              //     title: data_title,
              //     description: "placeholder",
              //     method: 'PPP',
              //     minObjectSize: '',
              //     status: 'completed',
              //     atlas: targetAtlas
              //   }
              // }
            // if (file.subdir === ".nesysWorkflowFiles/pointClouds/per_object") {
            //   // split on / and get the last element
            //   let minObjectSize = file.subdir.split('/').pop()
            //   let update = {
            //     key: data_title,
            //     title: data_title,
            //     description: "placeholder",
            //     method: 'PPO',
            //     minObjectSize: minObjectSize,
            //     status: 'completed',
            //     atlas: targetAtlas
            //   }
            // }

      // }
      // });

    // })
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
  const [visible, setVisible] = useState(false);

  const onClick = () => {
    let newProcessedDataSource = [];
    if (pointPerPixel) {
      let PPPDataSource = targetKeys.map(key => dataSource[parseInt(key) - 1]);
      PPPDataSource= PPPDataSource.map(obj => {
        return {
          key: `${obj.title}_${targetAtlas}_PPP`,
          title: obj.title,
          description: obj.description,
          method: 'PPP',
          minObjectSize: '',
          status: 'Complete',
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
          key: `${obj.title}_${targetAtlas}_PPO_${minObjectSize}`,
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

    newProcessedDataSource = [...processedDataSource, ...newProcessedDataSource]
    // remove duplicate keys
    newProcessedDataSource = [...new Set(newProcessedDataSource.map(obj => obj.key))].map(key => {
      return newProcessedDataSource.find(obj => obj.key === key)
    })
    setProcessedDataSource(newProcessedDataSource);
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
    // Show loading dialog
    setVisible(true);
    console.log('visible', visible)
      // Hide loading dialog after 45 seconds
    socket.on('message', (data) => {
      console.log('Received message:', data);

      if (data === 'Finished') {
        setVisible(false);
      }
      else {
        setProgress(
          parseInt(data)
        )
      }

    });

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
    let localizoomUrl = "https://webwarp.apps.ebrains.eu/collab.php?clb-collab-id="
    localizoomUrl += bucketName
    localizoomUrl += "&filename=.nesysWorkflowFiles/alignmentJsons/"
    localizoomUrl += title
    localizoomUrl += ".waln"
    window.open(localizoomUrl, "_blank")
  }
  const openMioViewer = (title) => {
    let viewerUrl = "https://dzseriesviewer.apps.ebrains.eu/index.html?bucket=https://dzip-svc.apps.ebrains.eu/fakebucket/?url=https://data-proxy.ebrains.eu/api/v1/buckets/"
    viewerUrl += bucketName
    viewerUrl += "?prefix=.nesysWorkflowFiles/zippedPyramids/"
    viewerUrl += title
    window.open(viewerUrl, "_blank")
  }

  const [progress, setProgress] = useState(0);
  useEffect(() => {
    if (visible) {
    } else {
      setProgress(0);
    }
     
  }, [visible]);

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

        <header className="App-header">

                  {/* place the image nutilweblogo.png at the top right of the page */}

        </header>
        <div className="center">
        <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >

      <Modal
        open={visible}
        title="Processing Brains"
        closable={false}
        centered

        footer={null}

      >
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '20rem' , gap:'5rem'}}>
          <Spin size="large" style={{ marginBottom: '2rem' }}>
            <h1 style={{ marginTop: '6rem', marginBottom: '6rem' }}>Processing Brains</h1>
            <div className="content" style={{ padding: '1rem' }} />
            <Progress percent={Math.round(progress * 100 / 43)} style={{ marginTop: '2rem' }} />
          </Spin>
        </div>
      </Modal>
      </div>

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
            <Space>
 
            </Space>
            <div style={{display:'flex', width:'72.5rem',flexDirection:'column', alignItems:'center', backgroundColor:'#F9F6EE',  border: '2px solid black' ,  borderRadius: '10px'}}>
            <Space direction='horizontal'>
            <div
            style={{display:'flex', flexDirection:'column', alignItems:'center', gap: '1rem',padding:'1rem' }}
            >
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

            <div width='30%'>
    <img src="nutil_logo.png" alt="nutilweblogo" style={{ width: '10rem', height: 'auto' }} />        
    </div>
    </Space>
            </div>

          </Space>

        </div>
      </div>
    );
  }
}

export default App;



