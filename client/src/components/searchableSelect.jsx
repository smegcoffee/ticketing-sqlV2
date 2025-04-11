import React, { useState } from "react";
import { Select, Option } from "@material-tailwind/react";

const SearchableSelect = ({ label, options, value, onChange }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div>
      <input
        type="text"
        placeholder={`Search ${label}`}
        value={searchTerm}
        onChange={handleInputChange}
      />
      <Select label={label} value={value} onChange={onChange}>
        {filteredOptions.map((option, index) => (
          <Option key={index} value={option}>
            {option}
          </Option>
        ))}
      </Select>
    </div>
  );
};

export { SearchableSelect };
