import {useState} from 'react'
import _ from 'lodash'
import {AvlModal, Button, useFalcor, Select} from '@availabs/avl-components'
import { CSVLink, CSVDownload } from "react-csv";

const MoreButton = ({className, data = [], columns, filteredColumns, setFilteredColumns}) => {
    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false);
    const [openColumnList, setOpenColumnList] = useState(false);
    const modalButtonTheme = `
            m-3
            bg-tigGray-200 
            hover:bg-tigGray-50 hover:cursor-pointer 
            py-2.5 px-2 font-semibold text-xs text-gray-600 rounded-sm`;

    console.log('d?', data)
    return (
        <div>
            <AvlModal show={open} onHide={() => setOpen(!open)}>
                <CSVLink
                    className={modalButtonTheme}
                    data={data.map(d => _.omit(d, filteredColumns))}
                >
                    Export Filtered
                </CSVLink>

                <CSVLink
                    className={modalButtonTheme}
                    data={data}
                >
                    Export All
                </CSVLink>

                <Button
                    className={`m-3
            bg-tigGray-200 
            hover:bg-tigGray-50 hover:cursor-pointer 
            py-1.5 px-2 font-semibold text-xs text-gray-600 rounded-sm`}
                    onClick={() => {
                        setOpenColumnList(!openColumnList)
                    }}
                >
                    Show/hide columns
                </Button>

                <div className={`${openColumnList ? 'block' : 'hidden'} flex ml-3 capitalize`}>
                    <label className={'self-center pr-3'} htmlFor={'show_hide_columns'}>Hide:</label>
                    <Select
                        id={'show_hide_columns'}
                        domain={columns}
                        value={filteredColumns}
                        onChange={e => setFilteredColumns(e)}
                        removable={true}
                        multi={true}
                    />
                </div>
            </AvlModal>

            <Button
                className={
                    `${className}`}
                onClick={() => setOpen(!open)}
            >
                <i className={'fa fa-wrench pr-1'}/> More...
            </Button>
        </div>
    )
}

export default MoreButton