import React from 'react';
import { PageTitle, StandardRow, StandardLargeContainer } from '../../../CommonStyles';
import { CenteredContainer } from '../styles';
import CityDetailsPane from './CityDetailsPane';
import { HintMessage, SurveyFootnote } from './styles';
import Spinner from '../../../components/Spinner';
import * as Survey from "survey-react";
import "survey-react/survey.css";
import queryString from 'query-string';
import once from 'lodash/once';
import isEqual from 'lodash/isEqual';

const questionsSet = {
  elements: [
    {
      type: "matrix",
      name: "evaluation",
      title: "* Please indicate your level of agreement with the following statements",
      isAllRowRequired: true,
      columns: [
        {
          value: "Strongly Disagree",
          text: "Strongly Disagree"
        },
        {
          value: "Disagree",
          text: "Disagree"
        },
        {
          value: "Neutral",
          text: "Neutral"
        },
        {
          value: "Agree",
          text: "Agree"
        },
        {
          value: "Strongly Agree",
          text: "Strongly Agree"
        }
      ],
      rows: [
        {
          value: "interest",
          text: "The final city recommended to me matched my interest."
        },
        {
          value: "suggestions",
          text: "This recommender system gave me good suggestions."
        },
        {
          value: "friend",
          text: "The recommendations I received better fits my interests than what I may receive from a friend."
        },
        {
          value: "familiar",
          text: "Some of the recommended cities are familiar to me."
        },
        {
          value: "attractive",
          text: "The cities recommended to me are attractive."
        },
        {
          value: "discovery",
          text: "This recommender system helped me discover new cities to travel to."
        },
        {
          value: "tell_like",
          text: "This recommender system allows me to tell what I like/dislike."
        },
        {
          value: "sufficient",
          text: "The information provided for the recommended cities is sufficient for me to make a travel decision."
        },
        {
          value: "adequate",
          text: "The layout of this recommender system interface is adequate."
        },
        {
          value: "easy_like",
          text: "I found it easy to tell this recommender system what I like/dislike."
        },
        {
          value: "easy_modify",
          text: "I found it easy to modify my preferences in this recommender system."
        },
        {
          value: "easy_inform",
          text: "I found it easy to inform the system if I dislike/like the currently recommended city."
        },
        {
          value: "familiar_quickly",
          text: "I became familiar with this recommender system very quickly."
        },
        {
          value: "attentionCheck",
          text: "Please select \"Disagree\" for this attention check."
        },
        {
          value: "ideal",
          text: "This recommender system helped me find the ideal city to travel to."
        },
        {
          value: "influence",
          text: "This recommender system influenced my selection of cities."
        },
        {
          value: "finding",
          text: "Finding a city to travel to with the help of this recommender system is easy."
        },
        {
          value: "control",
          text: "I feel in control of modifying my preferences."
        },
        {
          value: "satisfied",
          text: "Overall, I am satisfied with this recommender system."
        },
        {
          value: "trust",
          text: "This recommender system can be trusted."
        },
        {
          value: "use_again",
          text: "I would use this recommender to find cities to travel to."
        },
      ]
    },
    { type: "radiogroup",
      name: "travelingFrequency",
      title: "How often do you usually travel for vacation? (a period of at least one night spent away from home; before the Covid-19 Pandemic)",
      isRequired: true,
      choices: [
        'Less than once a year',
        'Once a year',
        '2-4 times a year',
        '5-7 times a year',
        'More than 7 times a year',
      ]
    },
    {
      type: "matrix",
      name: "predictorRelevance",
      title: "* Please indicate how important each of the aspects below is to you, when choosing a travel destination",
      isAllRowRequired: true,
      columns: [
        {
          value: "Not important at all",
          text: "Not important at all"
        },
        {
          value: "Slightly important",
          text: "Slightly important"
        },
        {
          value: "Important",
          text: "Important"
        },
        {
          value: "Very important",
          text: "Very important"
        },
        {
          value: "Extremely important",
          text: "Extremely important"
        }
      ],
      rows: [
        {
          value: "weather",
          text: "Weather"
        },
        {
          value: "food",
          text: "A variety of cafes and restaurants"
        },
        {
          value: "artsAndEntertainment",
          text: "Plentiful cultural and entertainment attractions"
        },
        {
          value: "outdoorsAndRecreation",
          text: "A multitude of outdoor activities"
        },
        {
          value: "nightlife",
          text: "Plentiful nightlife hotspots"
        },
        {
          value: "shopsAndServices",
          text: "An abundance of shops and services"
        },
        {
          value: "cost",
          text: "Price level"
        },
      ]
    },
    { type: "radiogroup",
      name: "gender",
      title: "Please select your gender",
      isRequired: true,
      choices: [
        'Male',
        'Female',
        'Other / prefer not to disclose',
      ]
    },
    { type: "radiogroup",
      name: "ageGroup",
      title: "Please select your age group",
      isRequired: true,
      choices: [
        '-20',
        '21-30',
        '31-40',
        '41-50',
        '51-60',
        '61-',
        'Prefer not to disclose',
      ]
    },
    {
      "type": "comment",
      "name": "comment",
      isRequired: false,
      title: "Additional comments regarding your experience with the recommender system (optional)"
    }
  ]
};

const questionsSubset = {
  elements: [
    // {
    //   type: "radiogroup",
    //   name: "recommendation",
    //   title: "Based on your preferences, which of the recommended travel destinations would you have selected?",
    //   isRequired: true,
    //   colCount: 2,
    //   choices: [
    //     'None of them'
    //   ]
    // },
    {
      type: "radiogroup",
      name: "interest",
      title: "The travel destinations recommended to me by CityRec, matched my interests",
      isRequired: true,
      colCount: 3,
      choices: [
        'Strongly agree',
        'Agree',
        'Neutral',
        'Disagree',
        'Strongly disagree',
      ]
    },
  ]
};

class FinalRecommendationPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedCityIndex: 0,
      model: new Survey.Model({ elements: [] }),
      prevCityIds: []
    }
  }

  componentDidMount() {
    const { shouldResetRecommenderProgress, resetRecommenderProgress, endTimeTracking } = this.props;
    if (shouldResetRecommenderProgress()) {
      resetRecommenderProgress();
    } else {
      endTimeTracking();
    }
  }

  // bad hacky solution :(
  static getDerivedStateFromProps(props, state) { 
    const cityIds = props.cities.map(c => c.id);
    if (!isEqual(cityIds, state.prevCityIds)) {
      const { location } = props;
      const urlParameters = queryString.parse(location.search);
      const surveyType = urlParameters.sv;
      
      let questions;
      if (surveyType === 'short') {
        questions = questionsSubset;
      } else {
        questions = questionsSet;
      }

      const model = new Survey.Model(questions);
      // model.getQuestionByName("recommendation").choices = [
      //   ...props.cities.slice(0,5).map((c, i) => `${c.name}|${c.name} - recommendation #${i+1}`),
      //   'none|None of them'
      // ];

      return { model, prevCityIds: cityIds };
    }
    return null;
  }
  
  onComplete = (survey, options) => {
    const { submitSurvey } = this.props;
    submitSurvey(survey.data);
  }
  onCompleteOnce = once(this.onComplete);

  render() {
    const { cities, isLoading, location, surveySubmitted } = this.props;
    const { selectedCityIndex, model } = this.state;
    const maxSimilarity = cities[0] ? 1/cities[0].distance : 0;

    const urlParameters = queryString.parse(location.search);
    const surveyType = urlParameters.sv;
    const isProlific = !!urlParameters.PROLIFIC_PID;

    return (
      isLoading
      ? <CenteredContainer><Spinner /></CenteredContainer>
      :
        <CenteredContainer>
          <CityDetailsPane city={cities[selectedCityIndex] || {}}  maxSimilarity={maxSimilarity} />
          {surveyType === 'short'
            ?
              <StandardRow>
                <StandardLargeContainer className="col-sm-12 col-md-12 offset-lg-1 col-lg-10">
                  <Survey.Survey
                    model={model}
                    onComplete={this.onCompleteOnce}
                    completeText="Submit answers"
                    completedHtml="<span id='title'>Thank you for the feedback!</span><span id='subtitle'>Click on 'Start over' to get change your preferences and get new recommendations.</span>"
                  />
                </StandardLargeContainer>
              </StandardRow>
            :
              isProlific
                ?
                <React.Fragment>
                  <Survey.Survey
                      model={model}
                      onComplete={this.onCompleteOnce}
                      completeText="Submit answers"
                      completedHtml="You are not being redirected to prolific!"
                  />
                  {surveySubmitted ? window.location.href = "https://app.prolific.co/submissions/complete?cc=6D4E4B23" : true}
                </React.Fragment>              
                : 
              <React.Fragment>
                <PageTitle style={{marginTop: '15px'}}>Research survey</PageTitle>
                {!surveySubmitted && 
                  <HintMessage>Please don’t forget to complete the survey. We greatly appreciate your help in our research. Afterwards, we will provide you an option to further explore CityRec and get new recommendations, without having to fill out the survey once again.</HintMessage>
                }
                <StandardRow>
                  <StandardLargeContainer className="col-sm-12 col-md-12 col-lg-12">
                    <Survey.Survey
                      model={model}
                      onComplete={this.onCompleteOnce}
                      completeText="Submit answers"
                      completedHtml="<span id='title'>Thank you for taking the time to complete this survey!</span><span id='subtitle'>We truly value the information you provided us with. Your responses will contribute to our research and help us find new ways how to improve tourism recommender systems! <br /> You can now further explore CityRec by clicking on 'Start over'. You will not be asked to fill out the survey again.</span>"
                    />

                    {!surveySubmitted && 
                      <SurveyFootnote>Note: questions marked with * are required!</SurveyFootnote>
                    }
                  </StandardLargeContainer>
                </StandardRow>
              </React.Fragment>              
          }
        </CenteredContainer>              
    );
  }
}

export default FinalRecommendationPage;