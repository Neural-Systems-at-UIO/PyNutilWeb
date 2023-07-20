import React, { useEffect, useState } from 'react';
import { Transfer } from 'antd';
import './SearchableList.css';
import { LoadingOutlined , HistoryOutlined} from '@ant-design/icons';
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
  height: '300px',
  border: '1px solid #d9d9d9',
  borderRadius: '8px',
  boxSizing: 'border-box',
  fontSize: '14px',
  lineHeight: '1.5714285714285714',
  listStyle: 'none',
  maxHeight: '300px',
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
const VersionsTable = ({ versions }) => {
  return (
    <div class="tableFixHead">
      <table style={{ margin: 'auto' }}>
        <caption style={{ fontWeight: 'bold' }}>Versions</caption>
        <thead>
          <tr>
            <th>Type</th>
            <th>Minimum Object Size</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {versions.map((version) => (
            <tr key={version.id}>
              <td>{version.type}</td>
              <td>{version.minObjectSize}</td>
              <td>{version.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
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

  const itemRenderer = (item) => (
    <Popover
      placement='right'
      trigger='click'
      content={<VersionsTable versions={versionsData} />}
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {item.isProcessing ? <Spin indicator={antIcon} style={{ marginRight: '10px'}} /> : null}
        {item.title}
          <HistoryOutlined style={{ marginLeft: '130px' }} />
      </div>
    </Popover>
  );


  return (
    <Transfer.List
      checkedKeys={[]}
      dataSource={props.processedDataSource}
      showSearch
      showSelectAll={false}
      showCheckbox={false}
      searchPlaceholder='Search brains'
      itemUnit='brains'
      itemsUnit='brains'
      titleText='Processed brains'
      style={transferListStyle}
      selectedItem={selectedItem}
      className='transferListCustom'
      onItemSelect={handleSelect}
      render={itemRenderer}
      handleFilter={handleFilter}
      handleClear={handleClear}
    />
  );
}