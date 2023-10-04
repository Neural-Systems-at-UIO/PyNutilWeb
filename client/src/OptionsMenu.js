import React, { useState } from 'react';
import { Select, InputNumber ,Space, Checkbox} from 'antd';

const { Option } = Select;

function OptionsMenu(props) {

const handlePointSettingChange = (value) => {
  console.log('point setting change', value)
  if (value.includes('pointPerObject')) {
    props.setPointPerObject(true);
  } else {
    props.setPointPerObject(false);
  }
  
  if (value.includes('pointPerPixel')) {
    props.setPointPerPixel(true);
  } else {
    props.setPointPerPixel(false);
  }
};


  const handleMinObjectSizeChange = (value) => {
    props.setMinObjectSize(value);

  };

  const handleTargetAtlasChange = (value) => {
    props.setTargetAtlas(value);
  };

  return (
    <Space direction='vertical'>
      <div style={{width:'40rem', display:'flex', flexDirection:'row'}}>
      <div style={{width:'15rem'}}>
      <span >Target atlas:</span>
      </div>        <Select
        style={{width:'20rem', marginLeft:'0.5rem'}}
        placeholder="Select target atlas"
        onChange={handleTargetAtlasChange}
        
      >
        {/* <Option value="WHSv2">WHS Rat Brain Atlas v2 2015</Option>
        <Option value="WHSv3">WHS Rat Brain Atlas v3 2019</Option>
        <Option value="WHSv4">WHS Rat Brain Atlas v4 2021</Option>
        <Option value="WHSv4.01">WHS Rat Brain Atlas v4.01 2023</Option>

        <Option value="allen2015">Allen Mouse Brain CCFv3 2015</Option> */}
        <Option value="allen2017">Allen Mouse Brain CCFv3 2017</Option>
        {/* commented out until we can automatically handle scale changes */}
        {/* <Option value="allen2022">Allen Mouse Brain CCFv3 2022</Option> */}

      </Select>
      </div>
      <div style={{width:'40rem', display:'flex', flexDirection:'row'}}>
        <div style={{width:'15rem'}}>
      <span >Point Calculation Method:</span>
      </div>
      <div>
      <Checkbox.Group
        style={{ marginLeft: '0.5rem' }}
        options={[
          { label: 'Point per pixel', value: 'pointPerPixel' },
          { label: 'Point per object', value: 'pointPerObject' }
        ]}
        onChange={handlePointSettingChange}
      />
    </div>
      </div>
      
        <div>
          <span>Minimum object size (px):</span>
          <InputNumber
                  style={{ marginLeft: '4.1rem' }}

            disabled={props.pointPerObject === false}
            min={0}
            defaultValue={0}
            onChange={handleMinObjectSizeChange}
          />
        </div>
      
    </Space>

  );
}

export default OptionsMenu;