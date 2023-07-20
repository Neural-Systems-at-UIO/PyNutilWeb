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