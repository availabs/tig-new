import React from "react"

export const TestModal1 = ({ layer }) => {
  return (
    <div className="w-screen max-w-2xl h-64">
      STUFF GOES HERE!!! WOOHOOHOO!!!<br />
      STUFF GOES HERE!!! WOOHOOHOO!!!<br />
      STUFF GOES HERE!!! WOOHOOHOO!!!<br />
      STUFF GOES HERE!!! WOOHOOHOO!!!<br />
      STUFF GOES HERE!!! WOOHOOHOO!!!<br />
      STUFF GOES HERE!!!<br />
      { JSON.stringify(layer.state) }
    </div>
  )
}

export const TestModal2 = ({ layer }) => {
  return (
    <div className="w-screen max-w-xl h-40">
      STUFF GOES HERE!!!<br />
      STUFF GOES HERE!!!<br />
      STUFF GOES HERE!!!<br />
      STUFF GOES HERE!!!<br />
      { JSON.stringify(layer.state) }
    </div>
  )
}
