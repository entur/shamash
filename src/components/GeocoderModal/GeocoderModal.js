import React, { useState, useEffect, useRef } from "react";
import debounce from "lodash.debounce";
import EnturService from "@entur/sdk";
import getPreferredTheme from "utils/getPreferredTheme";

import { TextField } from "@entur/form";
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  HeaderCell as TableHeaderCell,
  DataCell as TableDataCell
} from "@entur/table";
import { CloseIcon } from "@entur/icons";

import "@entur/form/dist/styles.css";
import "@entur/table/dist/styles.css";
import "@entur/icons/dist/styles.css";

import "./styles.css";

const service = new EnturService({ clientName: "entur-shamash" });

const autocompleteSearch = debounce(
  (query, callback) =>
    service
      .getFeatures(query, undefined, {
        limit: 8
      })
      .then(callback),
  400
);

function GeocoderModal({ onDismiss }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const modalRef = useRef(null);
  const [copiedPopupStyle, setCopiedPopupStyle] = useState({
    top: 10,
    left: 10
  });
  const theme = getPreferredTheme();

  let popupTimeout = null;

  useEffect(() => {
    if (query) {
      autocompleteSearch(query, setResults);
    } else {
      setResults([]);
    }
  }, [query]);

  const handleRowClick = (newClip, event) => {
    const { clientX, clientY } = event;
    navigator.permissions.query({ name: "clipboard-write" }).then(result => {
      if (result.state === "granted" || result.state === "prompt") {
        navigator.clipboard.writeText(newClip).then(
          function() {
            const { offsetLeft = 0, offsetTop = 0 } = modalRef
              ? modalRef.current
              : {};
            setCopiedPopupStyle({
              opacity: 1,
              left: clientX - offsetLeft,
              top: clientY - offsetTop
            });
            clearTimeout(popupTimeout);
            popupTimeout = setTimeout(
              () => setCopiedPopupStyle({ opacity: 0 }),
              1000
            );
          },
          () => {
            setCopiedPopupStyle(null);
          }
        );
      }
    });
  };

  const onOverlayClick = event => {
    event.stopPropagation();
    onDismiss();
  };

  return (
    <>
      <div className="geocoder-modal-overlay" onClick={onOverlayClick} />
      <div className={`geocoder-modal geocoder-modal--${theme}`} ref={modalRef}>
        <button
          className={`geocoder-modal__close-button close-button--${theme}`}
          onClick={onDismiss}
        >
          <CloseIcon />
        </button>
        <h2 className={`geocoder-modal__title--${theme}`}>Geocoder</h2>
        <p>
          Search for IDs for stop places which you then can use in your
          JourneyPlanner queries. Click a row to copy the ID to your clipboard.
        </p>
        <TextField
          value={query}
          onChange={e => setQuery(e.currentTarget.value)}
          placeholder="Jernbanetorget"
          width="fluid"
          className={`geocoder-modal__input geocoder-modal__input--${theme}`}
          autoFocus
        />
        <Table width="fluid" className="geocoder-modal__table">
          <TableHead>
            <TableRow className={`geocoder-modal__table-row--${theme}`}>
              <TableHeaderCell
                className={`geocoder-modal__table-header--${theme}`}
                align="left"
              >
                Label
              </TableHeaderCell>
              <TableHeaderCell
                className={`geocoder-modal__table-header--${theme}`}
                align="left"
              >
                ID
              </TableHeaderCell>
              <TableHeaderCell
                className={`geocoder-modal__table-header--${theme}`}
                align="left"
              >
                Categories
              </TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {results.map(feature => {
              const { id, label, category } = feature.properties;
              return (
                <TableRow
                  className={`geocoder-modal__table-row--${theme}`}
                  key={id}
                  onClick={event => handleRowClick(id, event)}
                >
                  <TableDataCell
                    className={`geocoder-modal__table-data--${theme}`}
                  >
                    {label}
                  </TableDataCell>
                  <TableDataCell
                    className={`geocoder-modal__table-data--${theme}`}
                  >
                    {id}
                  </TableDataCell>
                  <TableDataCell
                    className={`geocoder-modal__table-data--${theme}`}
                  >
                    {category.join(", ")}
                  </TableDataCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        <div
          className={`copied-popup copied-popup--${theme}`}
          style={copiedPopupStyle}
        >
          ID copied!
        </div>
      </div>
    </>
  );
}

export default GeocoderModal;
