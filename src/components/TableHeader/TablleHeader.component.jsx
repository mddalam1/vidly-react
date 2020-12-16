import React, { Component } from 'react'

class TableHeader extends Component {

    raiseSort = path => {
        let sortColumn = {...this.props.sortColumn}
        if(sortColumn.path === path)
        sortColumn.order = sortColumn.order === 'asc' ? 'desc' : 'asc'
        else 
        sortColumn = { path, order : 'asc'}
        this.props.handleSort(sortColumn)
    }
    renderSortIcon = column => {
        if(column.path !== this.props.sortColumn.path) return null
        if(this.props.sortColumn.order === 'asc') return <i className="fa fa-sort-asc" aria-hidden="true"></i>
        return <i class="fa fa-sort-desc" aria-hidden="true"></i>

    }

    render() { 
        const {columns} = this.props
        return ( 
            <thead>
                <tr>
                    {columns.map(column => 
                        <th style={{cursor:'pointer'}}
                            key={column.path || column.key} 
                            onClick={()=> {this.raiseSort(column.path)}}
                        >{column.label} {this.renderSortIcon(column)}</th>)}
                </tr>
            </thead>
         )
    }
}
 
export default TableHeader;