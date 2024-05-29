import React, { useEffect, useState } from 'react';
import { Transfer, Button } from 'antd';
import './SearchableList.css';
import { LoadingOutlined , HistoryOutlined, CheckCircleOutlined, DownloadOutlined} from '@ant-design/icons';
import { Spin , Tooltip,Popover} from 'antd';


export default function TransferList(props) {
  const antIcon = (
    <LoadingOutlined
      style={{
        fontSize: 24,
      }}
      spin
    />
  );
const transferListStyle = {
  display: 'flex',
  flexDirection: 'column',
  height: '400px',
  width:'30rem',
  border: '1px solid #d9d9d9',
  borderRadius: '8px',
  boxSizing: 'border-box',
  fontSize: '14px',
  lineHeight: '2rem',
  listStyle: 'none',
  maxHeight: '400px',
  marginLeft: '1.5rem',
  // overflow: 'auto',
  fontFamily: '-apple-system,BlinkMacSystemFont,\'Segoe UI\',Roboto,\'Helvetica Neue\',Arial,\'Noto Sans\',sans-serif,\'Apple Color Emoji\',\'Segoe UI Emoji\',\'Segoe UI Symbol\',\'Noto Color Emoji\'',
};
const [selectedItem, setSelectedItem] = useState(null);
  const handleFilter = (inputValue) => {
    return;
  };

  const handleClear = () => {
    return;
  };

  const handleSelect = (item) => {


    return
  };

  const ButtonColumn = ({ title }) => {

    const openLocaliZoomHandler = () => {
      let localizoomUrl = "https://webwarp.apps.ebrains.eu/collab.php?clb-collab-id="
      localizoomUrl += props.bucketName
      localizoomUrl += "&filename=.nesysWorkflowFiles/alignmentJsons/"
      localizoomUrl += title
      localizoomUrl += ".waln"
      window.open(localizoomUrl, "_blank")
    }
  
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <Button type="primary"onClick={openLocaliZoomHandler}>Open in LocaliZoom</Button>
        <Button type="primary">Download Analysis</Button>
      </div>
    );
  };
const VersionsTable = ({ versions, title }) => {
  return (
    <>
    <ButtonColumn title={title} />
    
    
    </>
    // <div className="tableFixHead">
    //   <table style={{ margin: 'auto' }}>
    //     <caption style={{ fontWeight: 'bold' }}>{title} Versions</caption>
    //     <thead>
    //       <tr>
    //         <th>Type</th>
    //         <th>Minimum Object Size</th>
    //         <th>Status</th>
    //       </tr>
    //     </thead>
    //     <tbody>
    //       {versions.map((version) => (
    //         <tr key={version.id}>
    //           <td>{version.type}</td>
    //           <td>{version.minObjectSize}</td>
    //           <td>{version.status}</td>
    //         </tr>
    //       ))}
    //     </tbody>W
    //   </table>
    // </div>
  );
};

const DownloadAnalysis = (title,method, minObjectSize, atlas) => {
  let method_string;
  if (method === 'PPO') {
    method_string =  minObjectSize + 'px'
  } else if (method === 'PPP') {
    method_string = 'point_per_pix'
  }
  let downloadUrl = process.env.REACT_APP_OIDC_CLIENT_REDIRECT_URL + "/download_file?clb-collab-id=" + props.bucketName + "&title=" + title + "&method=" + method_string + "&atlas=" + atlas ;
  console.log(downloadUrl)
  // request zip from server
  fetch(downloadUrl, {
    method: 'GET',
  
  })
  .then(response => response.blob())
  .then(blob => {
    // Create blob link to download
    const url = window.URL.createObjectURL(
      new Blob([blob]),
    );
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `${title}_${method_string}_${atlas}.zip`,
    );
    // Append to html link element page
    document.body.appendChild(link);
    // Start download
    link.click();
    // Clean up and remove the link
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);
  })
  .catch(error => {
    console.error('Error downloading analysis:', error);
  });
};

const openMeshViewHandler = (title, method, minObjectSize, atlas) => {
  let meshviewUrl = `https://meshview.apps.ebrains.eu/?atlas=ABA_Mouse_CCFv3_2017_25um&cloud=https://data-proxy.ebrains.eu/api/v1/buckets/${props.bucketName}/.nesysWorkflowFiles/pointClouds/${title}`;
  console.log(`method: ${method}, minObjectSize: ${minObjectSize}, atlas: ${atlas}, title: ${title}`)
  if (method === 'PPO') {
    meshviewUrl += `/min_obj_${minObjectSize}px/${atlas}/objects_meshview.json`;
  } else if (method === 'PPP') {
    meshviewUrl += `/per_pixel/${atlas}/pixels_meshview.json`;
  }

  window.open(meshviewUrl, "_blank");
}
const itemRenderer = (item) => (
  <>
    <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
      {item.isProcessing ? (
        <Spin indicator={antIcon} style={{ marginRight: '10px' }} />
      ) : (
        <CheckCircleOutlined style={{ marginRight: '10px', color: 'green' }} />
      )}
      <div style={{marginRight:'10px'}}>
      {item.title}
      </div>
      <div style={{ fontWeight: 'bold', marginRight: '10px', minWidth: '2rem'}}>{item.method}</div>
      <div style={{ marginRight: '10px', minWidth: '2rem'}}>{item.minObjectSize}</div>
      <div style={{ fontWeight: 'bold', marginRight: '10px', minWidth: '2rem'}}>{item.atlas}</div>

      <div style={{ position: 'absolute', right: 0 }}>
        <Button size="small" style={{ marginRight: '10px' }} onClick={() => openMeshViewHandler(item.title, item.method, item.minObjectSize, item.atlas)}>MeshView</Button>
        {/* <Popover placement='right' trigger='click' content={<VersionsTable versions={versionsData} title={item.title}/>}> */}
        <Button size="small" style={{ marginRight: '10px' }} icon={<DownloadOutlined />} onClick={
          () => DownloadAnalysis(item.title, item.method, item.minObjectSize, item.atlas)
        }></Button>
        {/* </Popover> */}

      </div>
    </div>
  </>
);

  return (
    <>
    {/* add text above the list */}
    <h2 style={{ textAlign: 'center' }}>Processed Brains</h2>

        <Transfer.List
      checkedKeys={[]}
      dataSource={props.processedDataSource}
      showSearch
      showSelectAll={false}
      showCheckbox={false}
      searchPlaceholder='Search brains'
      itemUnit='brains'
      itemsUnit='brains'
      style={transferListStyle}
      selectedItem={selectedItem}
      className='transferListCustom'
      onItemSelect={handleSelect}
      render={itemRenderer}
      handleFilter={handleFilter}
      handleClear={handleClear}
    />
    </>

  );
}