import React , { useState, useEffect } from 'react';
import axios from 'axios';
import _ from 'lodash';
import './App.css';
import { EditingState, IntegratedEditing, ViewState } from '@devexpress/dx-react-scheduler';
import { EditRecurrenceMenu, Scheduler, MonthView, Appointments, AppointmentTooltip, AppointmentForm, ConfirmationDialog, Toolbar, DateNavigator, TodayButton} from '@devexpress/dx-react-scheduler-material-ui';
import uuidv1 from  'uuid/v1';

function App() {

    const [data, setData] = useState([]);
    const [pageLoad,setPageLoad] = useState(true);
    useEffect(() => {
        if (pageLoad)
        {
            axios.get(
                process.env.REACT_APP_SCHEDULER + "/getAllSchedules",
            ).then(result => {
                if (result && result.data && !_.isEqual(result.data.sort(), data.sort())) {
                    setData(result.data);
                    setPageLoad(false);
                }
            }).catch(err => {
                console.log("Error fetching schedules");
            })
        }
    },[data,setData,pageLoad,setPageLoad]);

    const [appointment, setAppointment] = useState();
    useEffect(() => {
        // Update the document title using the browser API
        if(appointment && appointment.added) {
            if(!_.isEmpty(appointment.added.title)&&!_.isEmpty(appointment.added.location)){
                let newId = uuidv1();
                setData(data => data.concat({id:newId, ...appointment.added }));
                axios.post(process.env.REACT_APP_SCHEDULER+"/createSchedules",{id:newId, ...appointment.added });
            }
        }
        else if(appointment && appointment.changed){
            setData(data => _.map(data, (changedAppointment) => {
                return Object.keys(appointment.changed)[0]===changedAppointment.id ? {...changedAppointment,...appointment.changed[Object.keys(appointment.changed)[0]]} : changedAppointment;
            }));
            axios.put(process.env.REACT_APP_SCHEDULER+"/updateSchedules",{filter:{id:Object.keys(appointment.changed)[0]},update:{...appointment.changed[Object.keys(appointment.changed)[0]]}})
                .catch(err => console.log("updated schedule error: " + JSON.stringify(err)));
        }else if(appointment && appointment.deleted){
            setData(data => _.filter(data, (deletedAppointment) => {
                return deletedAppointment.id !== appointment.deleted;
            }));
            axios.delete(process.env.REACT_APP_SCHEDULER+"/deleteSchedules",{data:{id:appointment.deleted}});
        }
    },[appointment]);


    const BasicLayout = ({ onFieldChange, appointmentData, ...restProps }) => {
        const onCustomFieldChange = (nextValue) => {
            onFieldChange({ location: nextValue });
        };

        return (
            <AppointmentForm.BasicLayout
                appointmentData={appointmentData}
                onFieldChange={onFieldChange}
                {...restProps}
            >
                <AppointmentForm.TextEditor
                    type="noteTextEditor"
                    value={appointmentData.location}
                    onValueChange={onCustomFieldChange}
                    placeholder="Location"
                />
                <AppointmentForm.Label style={{color:"red", visibility:appointmentData.title?"hidden":"visible"}} type="ordinaryLabel" text="Please enter title."/>
                <AppointmentForm.Label style={{color:"red", visibility:appointmentData.location?"hidden":"visible"}} type="ordinaryLabel" text="Please enter location."/>
            </AppointmentForm.BasicLayout>
        );
    };

  return (
      <Scheduler
          data={data}
      >
        <ViewState
            defaultCurrentDate={new Date()}
            defaultCurrentViewName="Month"
      />

        <MonthView />
          <Toolbar flexibleSpaceComponent={()=>{return <Toolbar.FlexibleSpace style={{flex:"0.8 0 0"}}><h4>To add a new appointment, double-click on any date square.</h4></Toolbar.FlexibleSpace>}}/>
        <DateNavigator />
        <TodayButton />
        <Appointments />
        <EditingState
            onCommitChanges={(added,changed,deleted)=>setAppointment(added,changed,deleted)}
            preCommitChanges={(added,changed,deleted)=>setAppointment(added,changed,deleted)}
        />
        <EditRecurrenceMenu/>
        <IntegratedEditing/>
        <AppointmentTooltip showDeleteButton showCloseButton showOpenButton />
        <AppointmentForm basicLayoutComponent={BasicLayout}/>
        <ConfirmationDialog />
      </Scheduler>
  );
}

export default App;
