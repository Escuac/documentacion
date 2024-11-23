import React, { useState, useEffect } from 'react'
import { IoChevronForwardOutline, IoCloseCircle, IoSearch } from 'react-icons/io5'
import st from './SearchBar.module.css'

export const FakeSearchBar = ({ className = "", text, onClean, isDisabled = true, showCloseIcon=true }) => {

  return (
    <>
      <div
        className={`${st["fake-input"]} ${className}`}
      >
        <IoSearch className={st["search-icon"]} />
        <input
          value={text}
          type="text"
          className={st["invisible-input"]}
          disabled={isDisabled}
        />
        {
          showCloseIcon &&
          <IoCloseCircle
            onClick={onClean}
            className="w-[1.5rem] h-[1.5rem] text-foreground/90 cursor-pointer" />
        }
      </div>
    </>
  )
}
