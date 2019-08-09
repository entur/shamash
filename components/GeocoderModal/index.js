import React, { useState, useEffect } from 'react'
import debounce from 'lodash.debounce'
import EnturService from '@entur/sdk'

import {
    TextField,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableHeaderCell,
    TableDataCell,
    CloseIcon,
} from '@entur/component-library'

import './styles.css'

const service = new EnturService({ clientName: 'entur-shamash' })

const autocompleteSearch = debounce((query, callback) => service.getFeatures(query).then(callback), 400)

function GeocoderModal({ onDismiss }) {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState([])

    useEffect(() => {
        if (query) {
            autocompleteSearch(query, setResults)
        } else {
            setResults([])
        }
    }, [query])

    return (
        <div className="geocoder-modal">
            <button className="geocoder-modal__close-button" onClick={onDismiss}>
                <CloseIcon />
            </button>
            <h2>Geocoder</h2>
            <TextField
                value={query}
                onChange={e => setQuery(e.currentTarget.value)}
                placeholder="Jernbanetorget"
                width="fluid"
                autofocus="true"
            />
            <Table width="fluid">
                <TableHead>
                    <TableRow>
                        <TableHeaderCell align="left">
                            Label
                        </TableHeaderCell>
                        <TableHeaderCell align="left">
                            ID
                        </TableHeaderCell>
                        <TableHeaderCell align="left">
                            Categories
                        </TableHeaderCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    { results.map(feature => {
                        const { id, label, category } = feature.properties
                        return (
                            <TableRow key={id}>
                                <TableDataCell>{ label }</TableDataCell>
                                <TableDataCell>{ id }</TableDataCell>
                                <TableDataCell>{ category.join(', ') }</TableDataCell>
                            </TableRow>
                        )}) }
                </TableBody>
            </Table>
          </div>
    )
}

export default GeocoderModal
