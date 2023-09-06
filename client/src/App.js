import React, { useEffect, useState } from 'react';
import { Space, Transfer, Button, Tooltip, Spin } from 'antd';
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
    let data = ListBucketObjects(bucketName, '.nesysWorkflowFiles/alignmentJsons/')
    data.then(
      (result) => {
        let files = result.objects.map((file) => {
          file.name = file.name.replace('.waln', '')
          // remove path from name
          file.name = file.name.replace('.nesysWorkflowFiles/alignmentJsons/', '')
          return file

          // exclude empty files
          // if (file.name !== '') {
          //   return file
          // }
        })
        // remove empty files
        files = files.filter((file) => {
          if (file.name !== '') {
            return file
          }
        })

        let tempDataSource = files.map((file, index) => {
          return {
            key: index + 1,
            title: file.name,
            description: file.name,
            chosen: false
          }
        })
        setDataSource(tempDataSource)


      }
    )
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
    const newProcessedDataSource = targetKeys.map(key => dataSource[parseInt(key) - 1]);
    setProcessedDataSource(processedDataSource => [...processedDataSource, ...newProcessedDataSource]);
    setTargetKeys([]);
    const brains = newProcessedDataSource.map(obj => obj.title).join(',');
    let oidc_redirect_uri = process.env.REACT_APP_OIDC_CLIENT_REDIRECT_URL;
    let url = `${oidc_redirect_uri}/process_brains?brains=${brains}&pointPerObject=${pointPerObject}&pointPerPixel=${pointPerPixel}&minObjectSize=${minObjectSize}&clb-collab-id=${bucketName}`
    console.log(url)
    fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `${token}`
      }
      })

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
            <Space direction='horizontal' style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Transfer
                dataSource={dataSource}
                targetKeys={targetKeys}
                showSearch
                render={item => item.title}
                listStyle={{ width: '45%', height: 300 }}
                locale={{ itemUnit: 'brains', itemsUnit: 'brains', searchPlaceholder: 'Search brains' }}
                titles={['Available Brains', 'Brains to Process']}
                onChange={onChange}
              />
              <TransferList
                processedDataSource={processedDataSource}
                bucketName={bucketName}
              />
            </Space>
            <OptionsMenu
              setMinObjectSize={setMinObjectSize}
              setPointPerObject={setPointPerObject}
              setPointPerPixel={setPointPerPixel}
              pointPerPixel={pointPerPixel}
            />
            <Space>
              {isButtonDisabled ? (
                <Tooltip placement="bottom" title="You must have brains in the 'Brains to process' menu and a point calculation method selected before proceeding" >
                  <span style={{ marginLeft: '8px' }}>
                    <Button type="primary" disabled={isButtonDisabled}>
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
          </Space>
        </div>
      </div>
    );
  }
}

export default App;



