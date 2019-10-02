import React, { useState, useEffect, useRef } from 'react'
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

const autocompleteSearch = debounce((query, callback) => service.getFeatures(query, undefined, {
    limit: 8
}).then(callback), 400)

function GeocoderModal({ onDismiss }) {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState([])
    const modalRef = useRef(null)
    const [copiedPopupStyle, setCopiedPopupStyle] = useState({ top: 10, left: 10 })

    let popupTimeout = null

    useEffect(() => {
        if (query) {
            autocompleteSearch(query, setResults)
        } else {
            setResults([])
        }
    }, [query])

    const handleRowClick = (newClip, event) => {
        const { clientX, clientY } = event
        navigator.permissions.query({ name: 'clipboard-write' }).then(result => {
            if (result.state == 'granted' || result.state == 'prompt') {
                navigator.clipboard.writeText(newClip).then(function() {
                    const { offsetLeft = 0, offsetTop = 0 } = modalRef ? modalRef.current : {}
                    setCopiedPopupStyle({ opacity: 1, left: clientX - offsetLeft, top: clientY - offsetTop })
                    clearTimeout(popupTimeout)
                    popupTimeout = setTimeout(() => setCopiedPopupStyle({ opacity: 0 }), 1000)
                }, () => {
                    setCopiedPopupStyle(null)
                  });
            }
        });
    }

    const onOverlayClick = (event) => {
        event.stopPropagation();
        onDismiss()
    }

    return (
        <>
            <div className="geocoder-modal-overlay" onClick={onOverlayClick} />
            <div className="geocoder-modal" ref={modalRef}>
                <button className="geocoder-modal__close-button" onClick={onDismiss}>
                    <CloseIcon />
                </button>
                <h2>Geocoder</h2>
                <p>
                    Search for IDs for stop places which you then can use in your JourneyPlanner queries.
                    Click a row to copy the ID to your clipboard.
                </p>
                <TextField
                    value={query}
                    onChange={e => setQuery(e.currentTarget.value)}
                    placeholder="Jernbanetorget"
                    width="fluid"
                    autoFocus
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
                                <TableRow key={id} onClick={event => handleRowClick(id, event)}>
                                    <TableDataCell>{ label }</TableDataCell>
                                    <TableDataCell>{ id }</TableDataCell>
                                    <TableDataCell>{ category.join(', ') }</TableDataCell>
                                </TableRow>
                            )}) }
                    </TableBody>
                </Table>
                <div className="copied-popup" style={copiedPopupStyle}>
                    ID copied!
                </div>
            </div>
        </>
    )
}

export default GeocoderModal
