import React, { useState } from 'react';
import { Select, InputNumber ,Space} from 'antd';

const { Option } = Select;

function OptionsMenu(props) {

const handlePointSettingChange = (value) => {
    if (value==='pointPerObject') {
            props.setPointPerObject(false);
            props.setPointPerPixel(true);
    } else if (value==='pointPerPixel') {
            props.setPointPerObject(true);
            props.setPointPerPixel(false);
    } else if (value==='both') {
            props.setPointPerObject(true);
            props.setPointPerPixel(true);
    }
};



  const handleMinObjectSizeChange = (value) => {
    props.setMinObjectSize(value);

  };

  return (
    <Space direction='horizontal'>
        <Select
        style={{ width: '250px' }}
        placeholder="Select target atlas"
        onChange={handlePointSettingChange}
      >
        <Option value="WHSv2">WHS Rat Brain Atlas v2 2015</Option>
        <Option value="WHSv3">WHS Rat Brain Atlas v3 2019</Option>
        <Option value="WHSv4">WHS Rat Brain Atlas v4 2021</Option>
        <Option value="WHSv4.01">WHS Rat Brain Atlas v4.01 2023</Option>

        <Option value="allen2015">Allen Mouse Brain CCFv3 2015</Option>
        <Option value="allen2017">Allen Mouse Brain CCFv3 2017</Option>
        <Option value="allen2022">Allen Mouse Brain CCFv3 2022</Option>

      </Select>
      <Select
        style={{ width: '250px' }}
        placeholder="Select point calculation method"
        onChange={handlePointSettingChange}
      >
        <Option value="pointPerPixel">Point per pixel</Option>

        <Option value="pointPerObject">Point per object</Option>
        <Option value="both">Both</Option>
      </Select>
      
        <div>
          <span>Minimum object size (px):</span>
          <InputNumber
            disabled={props.pointPerPixel === false}
            min={0}
            defaultValue={0}
            onChange={handleMinObjectSizeChange}
          />
        </div>
      
    </Space>
  );
}

export default OptionsMenu;