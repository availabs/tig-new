import {useState} from 'react'
import {AvlModal, Button, useFalcor, Select} from '@availabs/avl-components'
import { CSVLink, CSVDownload } from "react-csv";

const MoreButton = ({className, data, columns, filteredColumns, setFilteredColumns}) => {
    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false);
    const [openColumnList, setOpenColumnList] = useState(false);
    const modalButtonTheme = `
            m-3
            bg-tigGray-200 
            hover:bg-tigGray-50 hover:cursor-pointer 
            py-1.5 px-2 font-light text-xs text-gray-600 rounded-sm`;

    return (
        <div>
            <AvlModal show={open} onHide={() => setOpen(!open)}>
                <CSVLink
                    className={modalButtonTheme}
                    data={data}
                >
                    Export Filtered
                </CSVLink>

                <Button
                    className={modalButtonTheme}
                    onClick={() => {

                    }}
                >
                    Export All
                </Button>

                <Button
                    className={modalButtonTheme}
                    onClick={() => {
                        setOpenColumnList(!openColumnList)
                    }}
                >
                    Show/hide columns
                </Button>

                <div>
                    <Select
                        className={openColumnList ? 'block' : 'hidden'}
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
                    `${className} 
            bg-tigGray-200 
            hover:bg-tigGray-50 hover:text-orange-300 hover:cursor-pointer 
            py-1.5 px-2 font-light text-xs text-gray-600 rounded-sm`}
                onClick={() => setOpen(!open)}
            >
                <i className={'fa fa-wrench pr-1'}/> More...
            </Button>
        </div>
    )
}

export default MoreButton