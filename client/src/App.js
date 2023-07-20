import React, { useState } from 'react';
import { Space, Transfer, Button, Tooltip } from 'antd';
import OptionsMenu from './OptionsMenu';
import TransferList from './TransferList';
import './App.css';

function App() {
  const [pointPerObject, setPointPerObject] = useState(false);
  const [pointPerPixel, setPointPerPixel] = useState(false);
  const [minObjectSize, setMinObjectSize] = useState(0);
  const [targetKeys, setTargetKeys] = useState([]);

  const isButtonDisabled = targetKeys.length === 0 || (!pointPerObject && !pointPerPixel);
const dataSource = [
  { key: '1', title: 'Brain 1', isProcessing:true },
  { key: '2', title: 'Brain 2', isProcessing:true },
  { key: '3', title: 'Brain 3', isProcessing:true },
  { key: '4', title: 'Brain 4', isProcessing:true },
  { key: '5', title: 'Brain 5', isProcessing:true },
  { key: '6', title: 'Brain 6', isProcessing:true },
  { key: '7', title: 'Brain 7', isProcessing:true },
  { key: '8', title: 'Brain 8', isProcessing:true },
  { key: '9', title: 'Brain 9', isProcessing:true },
  { key: '10', title: 'Brain 10' },
];
  const [processedDataSource, setProcessedDataSource] = useState([]);

  const onChange = (nextTargetKeys) => {
    console.log('targetKeys:', nextTargetKeys)
    setTargetKeys(nextTargetKeys);
  };
  const onClick = () => {
    const NewprocessedDataSource = targetKeys.map(key => dataSource[parseInt(key) - 1]);
    setProcessedDataSource(processedDataSource => [...processedDataSource, ...NewprocessedDataSource]);
    setTargetKeys([]);
  }

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
              <Tooltip title="You must have brains in the 'Brains to process' menu and a point calculation method selected before proceeding">
                <span style={{ marginLeft: '8px' }}>
                <Button type="primary" disabled={isButtonDisabled}>
              Process Brains
            </Button>                </span>
              </Tooltip>
            ) :  <Button type="primary" onClick={onClick}>
            Process Brains
          </Button>}
          </Space>
        </Space>
      </div>
    </div>
  );
}

export default App;