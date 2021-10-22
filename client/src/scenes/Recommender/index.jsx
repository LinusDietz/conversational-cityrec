import React, { Component } from 'react';
import { Switch, Route, Redirect } from "react-router-dom";
import { StandardContainer } from '../../CommonStyles';
import Stepper from './Stepper';
import PreferencesPage from './PreferencesPage';
import RefiningPage from './RefiningPage';
import RecommendationsPage from './RecommendationsPage';
import CritiquingPage from './CritiquingPage';
import { fetchCities, fetchRecommendations, fetchRefinedRecommendations, postSurvey, fetchRecommendationWithCritiques, fetchRecommendationWithEliminationCritiques, fetchInitialRecommendationWithCritiques } from './api';
import queryString from 'query-string';
import filter from 'lodash/filter';
import { Notification } from 'react-notification';
import FinalRecommendationPage from "./FinalRecommendationPage";

const initialState = {
  cities: [],
  recommendations: [],
  selectedCities: new Set(),
  refinements: {
    cost: 0,
    temperature: 0,
    food: 0,
    arts: 0,
    outdoors: 0,
    nightlife: 0,
    shops: 0,
    transport: 0
  },
  isLoading: false,
  shouldShowSelectionWarning: false,
  refinementsCompleted: false,
  surveySubmitted: false,
  startTime: 0,
  endTime: 0,
  clickCount: 0,
  dismissedCities: [],
  cityRefreshCount: 0,
  critiquedFeature: ''
}

const CITY_SELECTION_LOWER_BOUND = 3;
const CITY_SELECTION_UPPER_BOUND = 5;

class Recommender extends Component {
  constructor(props) {
    super(props);
    this.state = initialState;
  }

  componentWillMount() {
    document.addEventListener('click', this.incrementClickCount, false);
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.incrementClickCount, false);
  }

  recordCityRefresh = () => {
    const { cities, cityRefreshCount, dismissedCities } = this.state;
    const citynames = cities.map(c => c.name);

    this.setState({
      cityRefreshCount: cityRefreshCount + 1,
      dismissedCities: [...dismissedCities, citynames]
    });
  }

  incrementClickCount = () => {
    const { pathname } = this.props.location;
    if (pathname === '/rec/preferences' || pathname === '/rec/critiquing-9f2c3dc5' || pathname === '/rec/critiquing-4cc20c83' || pathname === '/rec/critiquing-64f91682') {
      this.setState({ clickCount: this.state.clickCount + 1 })
    }
  }

  resetRecommenderProgress = () => {
    const { match, history, location } = this.props;
    this.setState(initialState);

    history.push(`${match.path}/preferences${location.search}`);
  }

  startTimeTracking = () => {
    this.setState({ startTime: (new Date()).getTime() });
  }
  endTimeTracking = () => {
    this.setState({ endTime: (new Date()).getTime() });
  }

  shouldResetRecommenderProgress = () => {
    const { cities } = this.state;
    return cities.length === 0;
  }

  getVersion = () => {
    const { location } = this.props;
    const urlParameters = queryString.parse(location.search);
    const versionArray = ["9f2c3dc5", "4cc20c83", "64f91682"];

    if (urlParameters.v) {
      const version = urlParameters.v;
      if (versionArray.includes(version)) {
        return version;
      }
    }

    return versionArray[Math.floor(Math.random() * versionArray.length)];
  }

  getVersionID = () => {
    const { location } = this.props;
    const urlParameters = queryString.parse(location.search);
    if (urlParameters.v) {
      const version = urlParameters.v;
      switch (version) {
        case '9f2c3dc5':
          return 2;
        case '4cc20c83':
          return 3;
        case '64f91682':
          return 4;
        default:
          return [2, 3, 4][Math.floor(Math.random() * 3)];
      }
    }
    return [2, 3, 4][Math.floor(Math.random() * 3)];
  }

  getVersionName = () => {
    const { location } = this.props;
    const urlParameters = queryString.parse(location.search);

    if (urlParameters.v) {
      const version = urlParameters.v;
      switch (version) {
        case '9f2c3dc5':
          return "unit";
        case '4cc20c83':
          return "conversational";
        case '64f91682':
          return 'conversational-eliminating';
        default:
          return 'Unknown';
      }
    }
    return "Unknown";
  }

  getCode = () => {
    const { location } = this.props;
    const urlParameters = queryString.parse(location.search);

    return urlParameters.c;
  }

  submitSurvey = surveyData => {
    const { cities, selectedCities, refinements, recommendations, startTime, endTime, clickCount, dismissedCities, cityRefreshCount } = this.state;
    const version = this.getVersionID();
    const code = this.getCode();

    const selectedCityNames = filter(cities, c => selectedCities.has(c.id)).map(c => c.name);

    const surveyCompleteData = {
      initialCities: cities.map(c => c.name),
      recommendations: recommendations.map(c => c.name),
      selectedCities: selectedCityNames,
      refinements,
      ...surveyData,
      version,
      code,
      clickCount,
      dismissedCities,
      cityRefreshCount,
      recommendationTimeTaken: endTime - startTime,

      surveyTimeTaken: (new Date()).getTime() - endTime
    };

    postSurvey(surveyCompleteData);
    this.setState({ surveySubmitted: true })
  }


  submitCritiquingSurvey = surveyData => {
    const { cities, selectedCities, refinements, startTime, endTime, clickCount, dismissedCities, cityRefreshCount } = this.state;
    const version = this.getVersionID();
    const code = this.getCode();

    const selectedCityNames = filter(cities, c => selectedCities.has(c.id)).map(c => c.name);

    postSurvey({
      initialCities: cities.map(c => c.name),
      // recommendations: recommendations.map(c => c.name),
      selectedCities: selectedCityNames,
      refinements,
      ...surveyData,
      version,
      code,
      clickCount,
      dismissedCities,
      cityRefreshCount,
      recommendationTimeTaken: endTime - startTime,

      surveyTimeTaken: (new Date()).getTime() - endTime
    });

    this.setState({ surveySubmitted: true })
  }

  resetSelectedCities = () => {
    this.setState({ selectedCities: new Set() });
  }

  getCities = async () => {
    this.setState({ isLoading: true });
    const cities = await fetchCities();
    this.setState({ cities, isLoading: false });
  }

  getRecommendations = async () => {
    const { selectedCities } = this.state;
    this.setState({ isLoading: true });
    const recommendations = await fetchRecommendations(selectedCities);
    this.setState({ recommendations, isLoading: false });
  }

  refineRecommendations = async () => {
    const { refinements } = this.state;
    this.setState({ isLoading: true });
    const recommendations = await fetchRefinedRecommendations(refinements);
    this.setState({
      recommendations, isLoading: false, refinements: {
        cost: 0,
        temperature: 0,
        food: 0,
        arts: 0,
        outdoors: 0,
        nightlife: 0,
        shops: 0,
        transport: 0
      }
    });
  }

  getInitialRecommendationWithCritiques = async () => {
    const { selectedCities } = this.state;
    this.setState({ isLoading: true });
    const version = this.getVersionID();
    const recommendationData = await fetchInitialRecommendationWithCritiques(selectedCities, version);
    const recommendations = recommendationData.cities;
    const statistics = recommendationData.statistics;
    this.setState({ recommendations, statistics, isLoading: false });
  }

  getRecommendationWithCritiques = async (selectedCityId, feature) => {
    this.setState({ isLoading: true });
    const version = this.getVersionID();
    const critiquedFeature = feature;
    const recommendationData = await fetchRecommendationWithCritiques(selectedCityId, critiquedFeature, version);
    const recommendations = recommendationData.cities;
    const statistics = recommendationData.statistics;
    this.setState({ recommendations, statistics, isLoading: false });
  }

  getRecommendationWithEliminationCritiques = async (selectedCityId, feature) => {
    this.setState({ isLoading: true });
    const version = this.getVersionID();
    const critiquedFeature = feature;
    const recommendationData = await fetchRecommendationWithEliminationCritiques(selectedCityId, critiquedFeature, version);
    const recommendations = recommendationData.cities;
    const statistics = recommendationData.statistics;
    this.setState({ recommendations, statistics, isLoading: false });
  }

  goToNextStep = path => {
    this.props.history.push(path);
  }

  getCurrentStepIndex = version => {
    const { location } = this.props;
    const steps = this.getSteps(version);

    for (const [i, step] of steps.entries()) {
      if (location.pathname.endsWith(step.pathname)) {
        return i;
      }
    }

    return 0;
  }

  nextStepEnabled = version => {
    const steps = this.getSteps(version);
    const currentStep = this.getCurrentStepIndex(version);
    const { selectedCities, refinementsCompleted, surveySubmitted } = this.state;
    switch (steps[currentStep].pathname) {
      case 'preferences':
        return selectedCities.size >= CITY_SELECTION_LOWER_BOUND && selectedCities.size <= CITY_SELECTION_UPPER_BOUND;
      case 'critiquing-9f2c3dc5':
        return refinementsCompleted;
      case 'recommendations':
        return surveySubmitted;
      case 'final-recommendation':
        return surveySubmitted;
      default:
        return false;
    }
  }

  setRefinementsCompletedFlag = refinementsCompleted => {
    this.setState({ refinementsCompleted });
  }

  toggleCitySelection = cityId => {
    const selectedCities = new Set(this.state.selectedCities);
    let shouldShowSelectionWarning;
    if (selectedCities.has(cityId)) {
      selectedCities.delete(cityId);
      shouldShowSelectionWarning = false;
    } else {
      if (selectedCities.size < CITY_SELECTION_UPPER_BOUND) {
        selectedCities.add(cityId);
      } else {
        shouldShowSelectionWarning = true;
      }
    }

    this.setState({ selectedCities, shouldShowSelectionWarning });
  }

  handleRefinementAction = (aspect, value) => {
    const { refinements } = this.state;
    this.setState({ refinements: { ...refinements, [aspect]: value } });
  }

  getSteps = (version) => {
    const { match, location } = this.props;
    const code = this.getCode();

    if (version === 1) {// NO Critiquing
      return [
        {
          name: '1. Tell us your general preferences',
          pathname: 'preferences',
          onNextClick: () => { this.getRecommendations(); this.goToNextStep(`${match.path}/recommendations${location.search}`) },
          nextButtonText: 'next step',
          disabledMessage: `Please select from ${CITY_SELECTION_LOWER_BOUND} to ${CITY_SELECTION_UPPER_BOUND} (at most) cities before proceeding!`
        },
        {
          name: '2. Get recommendations',
          pathname: 'recommendations',
          onNextClick: () => { this.setState(initialState); this.goToNextStep(`${match.path}/preferences?v=2&sv=short${code ? `&c=${code}` : ''}`); },
          nextButtonText: 'start over',
          disabledMessage: 'Please complete the survey first! We greatly appreciate your help in our research.'
        },
      ];
    }
    else if (version === "9f2c3dc5") { // Unit Critiquing
      return [
        {
          name: '1. Tell us your general preferences',
          pathname: 'preferences',
          onNextClick: () => { this.getRecommendations(); this.goToNextStep(`${match.path}/critiquing-9f2c3dc5${location.search}`) },
          nextButtonText: 'next step',
          disabledMessage: `Please select from ${CITY_SELECTION_LOWER_BOUND} to ${CITY_SELECTION_UPPER_BOUND} (at most) cities before proceeding!`
        },
        {
          name: '2. Refine your preferences',
          pathname: 'critiquing-9f2c3dc5',
          onNextClick: () => { this.goToNextStep(`${match.path}/final-recommendation${location.search}`) },
          nextButtonText: '',
          disabledMessage: ''
        },
        {
          name: '3. Get recommendations',
          pathname: 'final-recommendation',
          onNextClick: () => { this.setState(initialState); this.goToNextStep(`${match.path}/preferences?v=2&sv=short${code ? `&c=${code}` : ''}`); },
          nextButtonText: 'start over',
          disabledMessage: 'Please complete the survey first! We greatly appreciate your help in our research.'
        },
      ];
    }
    else if (version === "4cc20c83") { // Conversational Critiqing with Utility Function
      return [
        {
          name: '1. Tell us your general preferences',
          pathname: 'preferences',
          onNextClick: () => { this.getInitialRecommendationWithCritiques(); this.goToNextStep(`${match.path}/critiquing-4cc20c83${location.search}`) },
          nextButtonText: 'next step',
          disabledMessage: `Please select from ${CITY_SELECTION_LOWER_BOUND} to ${CITY_SELECTION_UPPER_BOUND} (at most) cities before proceeding!`
        },
        {
          name: '2. Refine your preferences',
          pathname: 'critiquing-4cc20c83',
          onNextClick: () => { this.goToNextStep(`${match.path}/final-recommendation${location.search}`) },
          nextButtonText: '',
          disabledMessage: ''
        },
        {
          name: '3. Get recommendations',
          pathname: 'final-recommendation',
          onNextClick: () => { this.setState(initialState); this.goToNextStep(`${match.path}/preferences?v=${version}&sv=short${code ? `&c=${code}` : ''}`); },
          nextButtonText: 'start over',
          disabledMessage: 'Please complete the survey first! We greatly appreciate your help in our research.'
        },
      ];
    }
    else if (version === "64f91682") {// Conversational Critiqing with Utility Function and Eliminations
      return [
        {
          name: '1. Tell us your general preferences',
          pathname: 'preferences',
          onNextClick: () => { this.getInitialRecommendationWithCritiques(); this.goToNextStep(`${match.path}/critiquing-64f91682${location.search}`) },
          nextButtonText: 'next step',
          disabledMessage: `Please select from ${CITY_SELECTION_LOWER_BOUND} to ${CITY_SELECTION_UPPER_BOUND} (at most) cities before proceeding!`
        },
        {
          name: '2. Refine your preferences',
          pathname: 'critiquing-64f91682',
          onNextClick: () => { this.goToNextStep(`${match.path}/final-recommendation${location.search}`) },
          nextButtonText: '',
          disabledMessage: ''
        },
        {
          name: '3. Get recommendations',
          pathname: 'final-recommendation',
          onNextClick: () => { this.setState(initialState); this.goToNextStep(`${match.path}/preferences?v=${version}&sv=short${code ? `&c=${code}` : ''}`); },
          nextButtonText: 'start over',
          disabledMessage: 'Please complete the survey first! We greatly appreciate your help in our research.'
        },
      ];
    }
    else {
      return [
        {
          name: 'Your are lost!!!',
          pathname: '/',
          nextButtonText: 'next step',
          disabledMessage: `LOST!`
        }
      ];
    }
  }

  render() {
    const { cities, recommendations, statistics, selectedCities, refinements, isLoading, shouldShowSelectionWarning, surveySubmitted } = this.state;
    const version = this.getVersion();

    const RenderedPreferencesPage = props =>
      <PreferencesPage {...props}
        cities={cities}
        getCities={this.getCities}
        toggleCitySelection={this.toggleCitySelection}
        selectedCities={selectedCities}
        isLoading={isLoading}
        startTimeTracking={this.startTimeTracking}
        resetSelectedCities={this.resetSelectedCities}
        recordCityRefresh={this.recordCityRefresh}
      />;
    const RenderedRefiningPage = props =>
      <RefiningPage {...props}
        cities={recommendations}
        refinements={refinements}
        handleRefinementAction={this.handleRefinementAction}
        resetRecommenderProgress={this.resetRecommenderProgress}
        shouldResetRecommenderProgress={this.shouldResetRecommenderProgress}
        isLoading={isLoading}
        setRefinementsCompletedFlag={this.setRefinementsCompletedFlag}
        onNextStepClick={this.getSteps("9f2c3dc5")[1].onNextClick}
        onCritiqueClick={this.refineRecommendations}
      />;
    const RenderedRecommendationsPage = props =>
      <RecommendationsPage {...props}
        cities={recommendations}
        resetRecommenderProgress={this.resetRecommenderProgress}
        shouldResetRecommenderProgress={this.shouldResetRecommenderProgress}
        submitSurvey={this.submitSurvey}
        isLoading={isLoading}
        endTimeTracking={this.endTimeTracking}
        surveySubmitted={surveySubmitted}
      />;
    const RenderedCritiquingPage = props =>
      <CritiquingPage {...props}
        cities={recommendations}
        statistics={statistics}
        refinements={refinements}
        handleRefinementAction={this.handleRefinementAction}
        resetRecommenderProgress={this.resetRecommenderProgress}
        shouldResetRecommenderProgress={this.shouldResetRecommenderProgress}
        isLoading={isLoading}
        setRefinementsCompletedFlag={this.setRefinementsCompletedFlag}
        onNextStepClick={this.getSteps("4cc20c83")[1].onNextClick}
        onCritiqueClick={this.getRecommendationWithCritiques}
      />;
    const RenderedCritiquingEliminationPage = props =>
      <CritiquingPage {...props}
        cities={recommendations}
        statistics={statistics}
        refinements={refinements}
        handleRefinementAction={this.handleRefinementAction}
        resetRecommenderProgress={this.resetRecommenderProgress}
        shouldResetRecommenderProgress={this.shouldResetRecommenderProgress}
        isLoading={isLoading}
        setRefinementsCompletedFlag={this.setRefinementsCompletedFlag}
        onNextStepClick={this.getSteps("64f91682")[1].onNextClick}
        onCritiqueClick={this.getRecommendationWithEliminationCritiques}
      />;
    const RenderedFinalRecommendationPage = props =>
      <FinalRecommendationPage {...props}
        cities={recommendations}
        resetRecommenderProgress={this.resetRecommenderProgress}
        shouldResetRecommenderProgress={this.shouldResetRecommenderProgress}
        submitSurvey={this.submitCritiquingSurvey}
        isLoading={isLoading}
        endTimeTracking={this.endTimeTracking}
        surveySubmitted={surveySubmitted}
      />;

    return (
      <React.Fragment>
        <Notification
          isActive={shouldShowSelectionWarning}
          message={`You can select at most ${CITY_SELECTION_UPPER_BOUND} cities. Try deselecting some cities!`}
          action="Dismiss"
          title="Warning"
          dismissAfter={3500}
          onDismiss={() => this.setState({ shouldShowSelectionWarning: false })}
          onClick={() => this.setState({ shouldShowSelectionWarning: false })}
        />
        <StandardContainer>
          <Switch>
            <Route path={`${this.props.match.path}/preferences`} render={RenderedPreferencesPage} />
            <Route path={`${this.props.match.path}/critiquing-9f2c3dc5`} render={RenderedRefiningPage} />
            <Route path={`${this.props.match.path}/recommendations`} render={RenderedRecommendationsPage} />
            <Route path={`${this.props.match.path}/final-recommendation`} render={RenderedFinalRecommendationPage} />
            <Route path={`${this.props.match.path}/critiquing-4cc20c83`} render={RenderedCritiquingPage} />
            <Route path={`${this.props.match.path}/critiquing-64f91682`} render={RenderedCritiquingEliminationPage} />
            <Redirect to={`${this.props.match.path}/preferences`} />
          </Switch>
        </StandardContainer>
        <Stepper steps={this.getSteps(version)} currentStep={this.getCurrentStepIndex(version)} nextStepEnabled={this.nextStepEnabled(version)} />
      </React.Fragment>
    );
  }
}

export default Recommender;