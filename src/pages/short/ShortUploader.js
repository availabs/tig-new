import React from "react"

import { format as d3format } from "d3"

import { Button, Table, useTheme, ScalableLoading } from "@availabs/avl-components"

const intFormat = d3format(",d");

// const RowLengths = {
//   "122": "Short Volume",
//   "41": "Short Class"
// }

const InitialState = {
  files: [],
  errors: [],
  over: false,
  badOver: false,
  loading: 0,
  worker: null
}
const Reducer = (state, action) => {
  const { type, ...payload } = action;
  switch (type) {
    case "set-worker":
      return {
        ...state,
        ...payload
      }
    case "drag-enter":
      return {
        ...state,
        over: true
      }
    case "drag-leave":
      return {
        ...state,
        over: false
      }
    // case "drop-files":
    //   return {
    //     ...state,
    //     over: false,
    //     loading: true
    //   }

    case "bad-drag-enter":
      return {
        ...state,
        badOver: true
      }
    case "bad-drag-leave":
      return {
        ...state,
        badOver: false
      }
    case "bad-drop-files":
      return {
        ...state,
        badOver: false
      }

    // case "drop-result":
    //   return {
    //     ...state,
    //     loading: false,
    //     files: [
    //       ...state.files,
    //       ...payload.files
    //     ],
    //     errors: [
    //       ...state.errors,
    //       ...payload.errors
    //     ]
    //   }

// occurs when files are dropped into drop area
    case "files-dropped":
      return {
        ...state,
        loading: state.loading + payload.length,
        badOver: false,
        over: false
      }
// occurs when a file is processed successfully
    case "add-file":
      return {
        ...state,
        loading: Math.max(0, state.loading - 1),
        files: [
          ...state.files,
          payload.file
        ]
      }
// occurs when a file fails to process
    case "add-error":
      return {
        ...state,
        loading: state.loading - 1,
        errors: [
          ...state.errors,
          payload.error
        ]
      }

    case "upload-start":
      return {
        ...state,
        loading: state.loading + payload.fileNames.length,
        files: state.files.map(file => {
          if (payload.fileNames.includes(file.name)) {
            return { ...file, status: "uploading" };
          }
          return file;
        })
      }
    case "upload-success":
      return {
        ...state,
        loading: state.loading - payload.fileNames.length,
        files: state.files.map(file => {
          if (payload.fileNames.includes(file.name)) {
            return { ...file, status: "upload-success" };
          }
          return file;
        })
      }
    case "upload-error": {
      const { fileNames, ...rest } = payload;
      return {
        ...state,
        loading: state.loading - payload.fileNames.length,
        files: state.files.map(file => {
          if (fileNames.includes(file.name)) {
            return { ...file, status: "upload-error", ...rest };
          }
          return file;
        })
      }
    }
    case "remove-file":
      return {
        ...state,
        files: state.files.filter(({ name }) => name !== payload.fileName)
      }
    case "remove-all-files":
      return {
        ...state,
        files: state.files.filter(({ status }) => status === "uploading")
      }

    case "remove-error":
      return {
        ...state,
        errors: state.errors.filter(({ name }) => name !== payload.fileName)
      }
    case "remove-all-errors":
      return {
        ...state,
        errors: []
      }
    default:
      return state;
  }
}

const makeMyWorker = dispatch => {
  const worker = new Worker("/js/shortWorker.js", { type: "module" });
  worker.onmessage = post => {

console.log("FROM WORKER:", post);

    const { result, msg } = post.data;
    if (result.type === "file") {
      dispatch({
        type: "add-file",
        file: result.file,
        msg
      })
    }
    else if (result.type === "error") {
      dispatch({
        type: "add-error",
        error: result.error,
        msg
      })
    }
    else if (result.type === "upload-success") {
      dispatch({
        type: "upload-success",
        fileNames: result["upload-success"],
        msg
      })
    }
    else if (result.type === "upload-error") {
      dispatch({
        type: "upload-error",
        fileNames: result["upload-error"],
        error: result.error,
        msg
      })
    }
  }
  class MyWorker {
    postMessage(...args) {
      worker.postMessage(...args);
    }
    terminate() {
      worker.terminate();
    }
  }
  return new MyWorker();
}

const ShortUploader = ({ user }) => {

  const [state, _dispatch] = React.useReducer(Reducer, InitialState);

  const Mounted = React.useRef(false);
  React.useEffect(() => {
    Mounted.current = true;
    return () => { Mounted.current = false; };
  }, []);

  const dispatch = React.useCallback(action => {
    Mounted.current && _dispatch(action);
  }, []);

  React.useEffect(() => {
    const worker = makeMyWorker(dispatch);
    dispatch({
      type: "set-worker",
      worker
    });
    return () => { worker.terminate(); };
  }, [dispatch]);

  const onDragEnter = React.useCallback(e => {
    e.stopPropagation();
    e.preventDefault();
    dispatch({ type: "drag-enter" });
  }, [dispatch]);
  const onDragOver = React.useCallback(e => {
    e.stopPropagation();
    e.preventDefault();
  }, []);
  const onDragLeave = React.useCallback(e => {
    e.stopPropagation();
    e.preventDefault();
    dispatch({ type: "drag-leave" });
  }, [dispatch]);

  const badDragEnter = React.useCallback(e => {
    e.stopPropagation();
    e.preventDefault();
    dispatch({ type: "bad-drag-enter" });
  }, [dispatch]);
  const badDragOver = React.useCallback(e => {
    e.stopPropagation();
    e.preventDefault();
  }, []);
  const badDragLeave = React.useCallback(e => {
    e.stopPropagation();
    e.preventDefault();
    dispatch({ type: "bad-drag-leave" });
  }, [dispatch]);
  const badDropFiles = React.useCallback(e => {
    e.stopPropagation();
    e.preventDefault();
    dispatch({ type: "bad-drop-files" });
  }, [dispatch]);

  const handleDrop = React.useCallback(e => {
    e.stopPropagation();
    e.preventDefault();
    const files = [...e.dataTransfer.files];
    state.worker.postMessage({
      type: "process-files",
      files
    });
    dispatch({
      type: "files-dropped",
      length: files.length
    });
  }, [dispatch, state.worker]);

  const removeFile = React.useCallback(file => {
    state.worker.postMessage({
      type: "remove-file",
      file
    })
    dispatch({
      type: "remove-file",
      fileName: file.name
    });
  }, [dispatch, state.worker]);
  const removeAllFiles = React.useCallback(() => {
    state.worker.postMessage({
      type: "remove-all-files"
    });
    dispatch({ type: "remove-all-files" });
  }, [dispatch, state.worker]);

  const uploadFile = React.useCallback(file => {
    state.worker.postMessage({
      type: "upload-files",
      files: [file],
      token: user.token
    });
    dispatch({
      type: "upload-start",
      fileNames: [file.name]
    });
  }, [dispatch, state.worker, user]);
  const uploadAllFiles = React.useCallback(() => {
    const files = state.files.filter(({ status }) => status === "awaiting-upload");
    state.worker.postMessage({
      type: "upload-files",
      files,
      token: user.token
    });
    dispatch({
      type: "upload-start",
      fileNames: files.map(f => f.name)
    });
  }, [state.files, dispatch, state.worker, user.token]);

  const FilesColumns = React.useMemo(() => {
    return [
      { accessor: "name",
        Header: "File Name"
      },
      { accessor: "dataType",
        Header: "Data Type"
      },
      // { accessor: "stationId",
      //   Header: "Station ID"
      // },
      // { accessor: "countId",
      //   Header: "Count ID"
      // },
      { accessor: "status",
        Header: "Status",
        Cell: ({ row }) => {
          return (
            <StatusComponent file={ row.original }/>
          )
        }
      },

      { accessor: "upload",
        Header: ({ row, data }) => {
          const disabled = data.reduce((a, c) => {
            return a && (c.status !== "awaiting-upload");
          }, true);
          return (
            <div className="flex justify-end">
              <Button onClick={ e => uploadAllFiles() }
                buttonTheme="buttonSmall"
                disabled={ disabled }>
                upload all
              </Button>
            </div>
          )
        },
        Cell: ({ row }) => {
          return (
            <div className="flex justify-end">
              <Button onClick={ e => uploadFile(row.original) }
                disabled={ row.original.status !== "awaiting-upload" }
                buttonTheme="buttonSmall">
                upload
              </Button>
            </div>
          )
        }
      },

      { accessor: "remove",
        Header: ({ row, data }) => {
          const disabled = data.reduce((a, c) => {
            return a && (c.status === "uploading");
          }, true);
          return (
            <div className="flex justify-end">
              <Button onClick={ e => removeAllFiles() }
                buttonTheme="buttonSmall"
                disabled={ disabled }>
                remove all
              </Button>
            </div>
          )
        },
        Cell: ({ row }) => {
          return (
            <div className="flex justify-end">
              <Button onClick={ e => removeFile(row.original) }
                disabled={ row.original.status === "uploading" }
                buttonTheme="buttonSmall">
                remove
              </Button>
            </div>
          )
        }
      },
    ];
  }, [removeFile, removeAllFiles, uploadFile, uploadAllFiles]);

  const removeError = React.useCallback(({ name }) => {
    dispatch({
      type: "remove-error",
      fileName: name
    });
  }, [dispatch]);
  const removeAllErrors = React.useCallback(() => {
    dispatch({ type: "remove-all-errors" });
  }, [dispatch]);

  const ErrorsColumns = React.useMemo(() => {
    return [
      { accessor: "name",
        Header: "File Name"
      },
      { accessor: "size",
        Header: () => (
          <div className="text-right">
            Bytes
          </div>
        ),
        Cell: ({ value }) => (
          <div className="text-right">
            { intFormat(value) }
          </div>
        )
      },
      { accessor: "mimeType",
        Header: "MIME Type"
      },
      { accessor: "error",
        Header: "Error"
      },
      { accessor: "action",
        Header: props => {
          return (
            <div className="flex justify-end">
              <Button onClick={ e => removeAllErrors() }
                buttonTheme="buttonSmall">
                remove all
              </Button>
            </div>
          )
        },
        Cell: ({ row }) => {
          return (
            <div className="flex justify-end">
              <Button onClick={ e => removeError(row.original) }
                buttonTheme="buttonSmall">
                remove
              </Button>
            </div>
          )
        }
      },
    ];
  }, [removeError, removeAllErrors]);

  return (
    <div className="mx-auto container py-20 w-full grid grid-cols-4 gap-2"
      onDragEnter={ badDragEnter }
      onDragOver={ badDragOver }
      onDragLeave={ badDragLeave }
      onDrop={ badDropFiles }>

      { !state.loading ? null :
        <div className={ `
          fixed top-0 right-0 bottom-0 left-0 flex items-center
          justify-center transition bg-blueGray-900 z-20
          pointer-events-none bg-opacity-75
        ` }>
          <ScalableLoading scale={ 2 }/>
        </div>
      }

      <div className={ `
          h-full col-span-1 rounded-lg border-4 transition relative p-2
          flex items-center justify-center flex-col
          ${ state.over ? "bg-blueGray-600" : "" }
        ` }
        style={ { minHeight: "400px" } }
        onDragEnter={ onDragEnter }
        onDragOver={ onDragOver }
        onDragLeave={ onDragLeave }
        onDrop={ handleDrop }>

        <div className={ `
            flex items-center justify-center pointer-events-none
            absolute top-0 right-0 bottom-0 left-0
          ` }>
          <span className={ `
              fa fa-file transition
              ${ state.over ? "opacity-100" : "opacity-25" }
            ` } style={ { fontSize: "10rem" } }/>
        </div>

      </div>

      <div className={ `
        col-span-3 h-full rounded-lg transition relative
        flex items-center justify-center flex-col
      ` }>

        { !state.files.length ?
          <div className="flex-1 w-full flex flex-col justify-center items-center">
            <div className="font-bold text-3xl flex items-center">
              <span className="fa fa-caret-left mr-2 text-6xl"/>
              <div className="inline-block">Drop files in the area to the left</div>
            </div>
          </div>
          :
          <div className="w-full relative">
            <TableContainer>
              <Table data={ state.files }
                columns={ FilesColumns }
                disableFilters={ true }
                disableSortBy={ true }/>
            </TableContainer>
          </div>
        }

      </div>

      { !state.errors.length ? null :
        <div className={ `
          flex items-center justify-center flex-col col-span-4
        ` }>
          <div className="w-full">
            <TableContainer>
              <Table data={ state.errors }
                columns={ ErrorsColumns }
                disableFilters={ true }
                disableSortBy={ true }/>
            </TableContainer>
          </div>
        </div>
      }

    </div>
  )
}
export default ShortUploader;

const TableContainer = ({ children }) => {
  const theme = useTheme();
  return (
    <div className={ `${ theme.headerBg } pb-4 rounded-md` }>
      { children }
    </div>
  )
}

const StatusComponent = ({ file }) => {
  const { status, error } = file;
  return (
    status === "uploading" ? (
      <div className="flex items-center">
        <ScalableLoading color="#fff" scale={ 0.175 }/>
        <span className="ml-2">upload in progress</span>
      </div>
    ) : status === "upload-success" ? (
      <div className="flex items-center">
        <span className="fa fa-thumbs-up"/>
        <span className="ml-2">upload succeeded</span>
      </div>
    ) : status === "upload-error" ? (
      <div className="flex items-center">
        <span className="fa fa-thumbs-up"
          style={ { transform: "scaleY(-1)" } }/>
        <span className="ml-2">upload failed: { error }</span>
      </div>
    ) : (
      <div className="flex items-center">
        <span className="fa fa-file"/>
        <span className="ml-2">awaiting upload</span>
      </div>
    )
  )
}

// const PromiseReader = file => {
//   return new Promise((resolve, reject) => {
//     const fr = new FileReader();
//     const { name, size, type } = file;
//
//     fr.onerror = e => {
//       reject({
//         type: "add-error",
//         error: {
//           name, size, mimeType: type,
//           error: "failed to load",
//           action: "remove"
//         }
//       });
//     };
//     fr.onload = loaded => {
//       const result = loaded.target.result,
//         data = result.trim().split(/[\n]+/)
//           .map(row => row.trim().split(/[,]/).map(r => r.trim()));
//
//       let len = data[0].length;
//
//       const fileOK = data.reduce((a, c, i) => {
//         if (i === 0) return a;
//         return a && (c.length in RowLengths) && (len === c.length);
//       }, true);
//
//       if (!fileOK) {
//         reject({
//           name, size, mimeType: type,
//           error: "incorrect data format",
//           action: "remove", rawData: result
//         })
//       }
//       else {
//         resolve({
//           name, size, mimeType: type, data, file,
//           dataType: RowLengths[len],
//           status: "awaiting-upload",
//           upload: "upload", remove: "remove",
//           rawData: result
//         });
//       }
//     };
//     fr.readAsText(file);
//   })
// }
