import React, {useEffect, useState, forwardRef} from 'react';
import MaterialTable from 'material-table';
import AddBox from '@material-ui/icons/AddBox';
import ArrowDownward from '@material-ui/icons/ArrowDownward';
import Check from '@material-ui/icons/Check';
import ChevronLeft from '@material-ui/icons/ChevronLeft';
import ChevronRight from '@material-ui/icons/ChevronRight';
import Clear from '@material-ui/icons/Clear';
import DeleteOutline from '@material-ui/icons/DeleteOutline';
import Edit from '@material-ui/icons/Edit';
import FilterList from '@material-ui/icons/FilterList';
import FirstPage from '@material-ui/icons/FirstPage';
import LastPage from '@material-ui/icons/LastPage';
import Remove from '@material-ui/icons/Remove';
import SaveAlt from '@material-ui/icons/SaveAlt';
import Search from '@material-ui/icons/Search';
import ViewColumn from '@material-ui/icons/ViewColumn';
import Amplify, {API} from 'aws-amplify';
import config from './aws-exports';

Amplify.configure(config);

function PopulateTable(props){
    const [number, setNumber] = useState(0);
    const [data, setData] = useState(props.data);
    const [display,setDisplay] = useState();


    useEffect(() => {
        data.map(async (camp, index) => {
            let free = 0;
            let url = '';
            if(camp.facility[0] === "All"){
                url = 'https://bccrdr.usedirect.com/rdr/rdr/fd/availability/getbyplace/'+ camp.placeId+'/startdate/'+camp.date+'/nights/'+camp.night+'/true?_=1616538168676'
            }else{
                url = 'https://bccrdr.usedirect.com/rdr/rdr/fd/availability/getbyfacility/'+ camp.facility[0]+'/startdate/'+camp.date+'/nights/'+camp.night+'/true?_=1616538168676'
            }
            const reqData = await fetch(url)
                .then(res => res.json())
                .then((result) => {
                    result.map((res) => {
                        if(res.IsFree && !res.IsLocked){
                            free ++;
                        }
                    })
                })
            camp.available = free;
            if(index == data.length - 1){
                setDisplay(true);
            }
        })
    })


    const tableIcons = {
        Add: forwardRef((props, ref) => <AddBox {...props} ref={ref} />),
        Check: forwardRef((props, ref) => <Check {...props} ref={ref} />),
        Clear: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
        Delete: forwardRef((props, ref) => <DeleteOutline {...props} ref={ref} />),
        DetailPanel: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
        Edit: forwardRef((props, ref) => <Edit {...props} ref={ref} />),
        Export: forwardRef((props, ref) => <SaveAlt {...props} ref={ref} />),
        Filter: forwardRef((props, ref) => <FilterList {...props} ref={ref} />),
        FirstPage: forwardRef((props, ref) => <FirstPage {...props} ref={ref} />),
        LastPage: forwardRef((props, ref) => <LastPage {...props} ref={ref} />),
        NextPage: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
        PreviousPage: forwardRef((props, ref) => <ChevronLeft {...props} ref={ref} />),
        ResetSearch: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
        Search: forwardRef((props, ref) => <Search {...props} ref={ref} />),
        SortArrow: forwardRef((props, ref) => <ArrowDownward {...props} ref={ref} />),
        ThirdStateCheck: forwardRef((props, ref) => <Remove {...props} ref={ref} />),
        ViewColumn: forwardRef((props, ref) => <ViewColumn {...props} ref={ref} />)
  };


    useEffect(()=>{
    }, [])

    return (
        <>
            {display && <MaterialTable
                className = "materialTable"
                icons = {tableIcons}
                title="Campsite Availability"
                columns={[
                    { title: 'Campsite Name', field: 'campName' },
                    { title: 'Date', field: 'date' },
                    { title: 'Nights', field: 'night'},
                    { title: 'Facility', field: 'facility[1]'},
                    { title: 'Available Units', field: 'available'},
                ]}
                data = {data}
                // onRowClick={((evt, selectedRow) => setSelectedRow(selectedRow.tableData.id))}
                editable={{
                    onRowDelete: oldData =>
                        new Promise((resolve, reject) => {
                            setTimeout(() => {
                                const dataDelete = [...data];
                                const index = oldData.tableData.id;
                                dataDelete.splice(index, 1);
                                //delete with oldData.id
                                API
                                    .del('campv2api', '/camp/object/'+oldData.email + '/' + oldData.id)
                                    .then(response => {
                                        // console.log(response);
                                    })
                                    .catch(error => {
                                        // console.log(error.response);
                                    });
                                setData([...dataDelete]);
                                resolve();
                            }, 2000);
                        })
                }}
                options={{
                    rowStyle:  rowData => ({
                        // backgroundColor: (rowData.tableData.id%2 == 0) ? '#EEE' : '#FFF',
                        fontSize: '14px',
                    }),
                    actionsColumnIndex: -1
                }}
            />}
            {display && <button className = "Refresh" type="submit"
                onClick={() => {
                    setNumber(number + 1);
                }}
            >
                Refresh Availability
            </button>}
            <br/>
    </>
  )
}


export default PopulateTable
