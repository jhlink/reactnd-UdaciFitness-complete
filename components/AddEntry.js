import React, { Component } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { getMetricMetaInfo, timeToString, getDailyReminderValue } from '../utils/helpers';
import UdaciSlider from './UdaciSlider';
import UdaciStepper from './UdaciStepper';
import DateHeader from './DateHeader';
import { Ionicons } from  '@expo/vector-icons';
import TextButton from './TextButton';
import { submitEntry, removeEntry } from '../utils/api';
import { connect } from 'react-redux';
import { addEntry } from '../actions';

const INIT_STATE = {
  run: 0,
  bike: 0,
  swim: 0,
  sleep: 0,
  eat: 0
};

function SubmitBtn ({ onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress }>
      <Text>SUBMIT</Text>    
    </TouchableOpacity>
  );
}
  


export default class AddEntry extends Component {
  state = INIT_STATE; 

  increment = (metric) => {
    const { max, step } = getMetricMetaInfo(metric);
  
    this.setState((state) => {
      const count = state[metric] + step;

      return {
        ...state,
        [metric]: count > max ? max: count
      };
    });
  }
        
  decrement = (metric) => {
    this.setState((state) => {
      const count = state[metric] - getMetricMetaInfo(metric).step;

      return {
        ...state,
        [metric]: count < 0 ? 0 : count
      };
    });
  }

  slide = (metric, value) => {
    this.setState(() => ({
      [metric]: value,
    }));
  }

  submit = () => {
    const key = timeToString();
    const entry = this.state;

    this.setState(INIT_STATE);


    this.props.dispatch(addEntry({
      [key]: entry
    }));

    // Navigate to home

    submitEntry({ key, entry });

    // Clear local notification
  }

  reset = () => {
    const key = timeToString();

    this.props.dispatch(addEntry({
      [key]: getDailyReminderValue()
    }));

    // Route to Home

    removeEntry(key);
  }
  
  render() {
    const metaInfo = getMetricMetaInfo();
    const localDateString = new Date().toLocaleDateString();

    if (this.props.alreadyLogged) {
      return (
        <View>
          <Ionicons
            name='ios-happy-outline'
            size={100}
          />
          <Text>You already logged your information for today</Text>
          <TextButton
            onPress={this.reset}>
            Reset
          </TextButton>
        </View>
      );
    }

    return (
      <View> 
        <DateHeader date={ localDateString }/>
        {Object.keys(metaInfo).map((key) => {
          const { getIcon, type, ...rest } = metaInfo[key];
          const value = this.state[key];

          return (
            <View key={key}>
              { getIcon() }
              { type === 'slider'
                ? <UdaciSlider
                  value={value}
                  onChange={(value) => this.slide(key, value)}
                  {...rest}
                />
                : <UdaciStepper
                  value={value}
                  onDecrement={() => this.decrement(key)}
                  onIncrement={() => this.increment(key)}
                  {...rest}
                />
              }

            </View>
          );
        })}
        <SubmitBtn onPress={this.submit}/>
      </View>
    );
  }
}
