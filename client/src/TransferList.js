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
      let localizoomUrl = "https://lz-nl.apps.hbp.eu/collab.php?clb-collab-id="
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
    //     </tbody>
    //   </table>
    // </div>
  );
};
const versionsData = [
  {
    id: 1,
    type: 'Point Per Object',
    minObjectSize: '10px',
    status: 'Complete',
  },
  {
    id: 2,
    type: 'Point Per Pixel',
    minObjectSize: 'NA',
    status: 'Processing',
  },
  {
    id: 3,
    type: 'Point Per Object',
    minObjectSize: '30px',
    status: 'Complete',
  },
  {
    id: 4,
    type: 'Point Per Pixel',
    minObjectSize: '20px',
    status: 'Inactive',
  },
  {
    id: 5,
    type: 'Point Per Object',
    minObjectSize: '15px',
    status: 'Active',
  },
  {
    id: 6,
    type: 'Point Per Pixel',
    minObjectSize: '25px',
    status: 'Inactive',
  },
  {
    id: 7,
    type: 'Point Per Object',
    minObjectSize: '20px',
    status: 'Active',
  },
  {
    id: 8,
    type: 'Point Per Pixel',
    minObjectSize: '30px',
    status: 'Complete',
  },
  {
    id: 9,
    type: 'Point Per Object',
    minObjectSize: '25px',
    status: 'Inactive',
  },
  {
    id: 10,
    type: 'Point Per Pixel',
    minObjectSize: '15px',
    status: 'Active',
  },
];
const DownloadAnalysis = (title) => {
  let downloadUrl = process.env.REACT_APP_OIDC_CLIENT_REDIRECT_URL + "/download_file?clb-collab-id=" + props.bucketName + "&file_path=" + title;
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
      `${title}.zip`,
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

const openMeshViewHandler = (title) => {
  let meshviewUrl = "https://meshview.apps.hbp.eu/?atlas=ABA_Mouse_CCFv3_2017_25um&cloud=https://data-proxy.ebrains.eu/api/v1/buckets/"
  meshviewUrl += props.bucketName
  meshviewUrl += "/.nesysWorkflowFiles/pointClouds/"
  meshviewUrl += title
  meshviewUrl += "/objects_meshview.json"
  window.open(meshviewUrl, "_blank")
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
        <Button size="small" style={{ marginRight: '10px' }} onClick={() => openMeshViewHandler(item.title)}>MeshView</Button>
        {/* <Popover placement='right' trigger='click' content={<VersionsTable versions={versionsData} title={item.title}/>}> */}
        <Button size="small" style={{ marginRight: '10px' }} icon={<DownloadOutlined />} onClick={
          () => DownloadAnalysis(item.title)
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