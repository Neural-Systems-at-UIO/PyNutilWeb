import './App.css';
import React from 'react';
import { Space, Transfer, Button } from 'antd';
import TransferList from 'antd/es/transfer/list';
import './SearchableList.css';

function App() {
  const transferListStyle = {
    display: 'flex',
    flexDirection: 'column',
    // width: '180px',
    height: '300px',
    border: '1px solid #d9d9d9',
    borderRadius: '8px',
    boxSizing: 'border-box',
    fontSize: '14px',
    lineHeight: '1.5714285714285714',
    listStyle: 'none',
    fontFamily: '-apple-system,BlinkMacSystemFont,\'Segoe UI\',Roboto,\'Helvetica Neue\',Arial,\'Noto Sans\',sans-serif,\'Apple Color Emoji\',\'Segoe UI Emoji\',\'Segoe UI Symbol\',\'Noto Color Emoji\''
  };
  

  function SearchAbleList() {
      
    const handleFilter = (inputValue) => {
  
      return ;
    }
    const handleClear = () => {
      return 

    };
    return (
        
        <Transfer.List
          checkedKeys={[]}
          dataSource={[
            {
              key: '1',
              title: 'Brain 1',
            },
            {
              key: '2',
              title: 'Brain 2',
            },
            {
              key: '3',
              title: 'Brain 3',
            },
          ]}
          showSearch
          showSelectAll={false}
          
          searchPlaceholder='Search brains'
          itemUnit='brains'
          itemsUnit='brains'
          titleText='Processed brains'
          style={transferListStyle}
          className='transferListCustom'
          render={item => item.title}
          handleFilter={handleFilter}
          handleClear={handleClear}

        />
    );
  }

  return (
    <div className="App">
      <header className="App-header">

      </header>
      <div className="center">
        <Space direction="vertical" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Space direction='horizontal' style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Transfer
              dataSource={[
                {
                  key: '1',
                  title: 'Brain 1',
                },
                {
                  key: '2',
                  title: 'Brain 2',
                },
                {
                  key: '3',
                  title: 'Brain 3',
                },
              ]}
              showSearch
              render={item => item.title}
              targetKeys={[]}
              listStyle={{ width: '45%', height: 300 }}
              locale={{ itemUnit: 'brains', itemsUnit: 'brains', searchPlaceholder: 'Search brains' }}
              titles={['Available Brains', 'Brains to Process']}
            />

            <SearchAbleList />
          </Space>
          <Space>
            <Button type="primary">Process Brains</Button>
            <Button>Cancel</Button>
          </Space>
        </Space>
      </div>
    </div>
  );
}

export default App;