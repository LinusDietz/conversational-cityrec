import React from 'react';
import { HintMessage, CenteredContainer } from '../styles';
import Spinner from '../../../components/Spinner';
import ReactTooltip from 'react-tooltip';
import ScoreRefiner from './ScoreRefiner';
import styled from 'styled-components';
import CityDetailsPane from "../FinalRecommendationPage/CityDetailsPane";

const Refiner = styled.div.attrs(() => ({
  className: 'offset-md-1 col-md-10 col-sm-12'
}
))`
  background-color: white;
  margin-bottom: 15px;
`;

const aspects = [
  {
    aspectName: 'food',
    aspectCodeName: 'food',
  },
  {
    aspectName: 'arts and entertainment',
    aspectCodeName: 'arts',
  },
  {
    aspectName: 'outdoors and recreation',
    aspectCodeName: 'outdoors',
  },
  {
    aspectName: 'nightlife',
    aspectCodeName: 'nightlife',
  },
  {
    aspectName: 'price level',
    aspectCodeName: 'cost',
  },
  {
    aspectName: 'average temperature',
    aspectCodeName: 'temperature',
  }
];

class RefiningPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      shouldFlash: true,
      currentAspectIndex: 0,
      critiquingCycle: 0
    }
    this.myRef = React.createRef();
  }


  componentDidMount() {
    const { shouldResetRecommenderProgress, resetRecommenderProgress } = this.props;
    if (shouldResetRecommenderProgress()) {
      resetRecommenderProgress();
    }
    this.scroll(this.myRef);
  }

  scroll(ref) {
    ref.current.scrollTo(0, 0);
  }

  isRefined = (refinements) => {
    return Object.values(refinements).reduce((a, b) => Math.abs(a) + Math.abs(b)) === 0;
  };
  static getDerivedStateFromProps(props, state) {
    let recommendedCity = props.cities[0];

    if (typeof recommendedCity !== 'undefined') {
      if (typeof state.recommendedCity === 'undefined') {

        return {
          shouldFlash: true,
          recommendedCity: recommendedCity,
          critiquedCity: recommendedCity
        };
      }
      if (recommendedCity.id !== state.recommendedCity.id) {
        let critiquingCycle = state.critiquingCycle;
        return {
          shouldFlash: true,
          recommendedCity: recommendedCity,
          critiquedCity: recommendedCity,
          critiquingCycle: critiquingCycle + 1
        };
      }
      return null;
    }
    return null;
  }
  render() {
    const { cities, refinements, isLoading, handleRefinementAction, onNextStepClick, onCritiqueClick } = this.props;
    let iteration = this.state.critiquingCycle;

    let city = cities[0] || {};
    let buttonTipText = "Select this city and finish recommendation";
    let disabledContinueText = "Please select one or several aspects to refine your preferences!";
    let continueText = "Continue recommendation with adjustments to the feature values";
    let sufficientCritiquingsteps = iteration >= 1;
    if (!sufficientCritiquingsteps) {
      buttonTipText = "This is our current recommendation for you. You should refine this recommendation a few times before you can submit.";
    } else {
      buttonTipText = "This was our initial recommendation for you. ";
    }
    return (
      <div ref={this.myRef}>
        <CenteredContainer>
          <HintMessage>
            We have computed this recommendation based on your previous choices.<br />
        In this step, your feedback helps us to better understand what you may like.<br />
        Please check out the initial recommendation below and fine-tune the recommendation by adjusting the individual aspects.<br />
        </HintMessage>
          {isLoading
            ? <Spinner />
            : <CityDetailsPane city={city} maxSimilarity={10} isLoading={isLoading} />
          }
                  <strong>Please refine the current recommendation until you are satisfied with the recommended city!</strong>

          {
            sufficientCritiquingsteps ?
              this.isRefined(refinements) ?
                <div>
                  <span data-tip={disabledContinueText}><button style={{ 'fontWeight': '600', 'borderRadius': '0px', 'marginRight': '5px', 'marginTop': '10px' }} onClick={() => onCritiqueClick(false)} disabled={true}>Continue Recommendation with Adjustments</button></span>
                  &nbsp;or&nbsp;
                  <span data-tip={buttonTipText}><button style={{ 'backgroundColor': '#88D68F', 'color': 'black', 'fontWeight': '600', 'borderRadius': '5px', 'margin': '5px', 'marginTop': '10px' }} onClick={() => onNextStepClick()}>Confirm {city.name}</button></span>
                </div>
                :
                <div>
                  <span data-tip={continueText}><button style={{ 'backgroundColor': '#474bde', 'color': 'white', 'fontWeight': '600', 'borderRadius': '5px', 'marginTop': '10px' }} onClick={() => onCritiqueClick(false)}>Continue Recommendation with Adjustments</button></span>
                  &nbsp;or&nbsp;
                  <span data-tip={buttonTipText}><button style={{ 'backgroundColor': '#88D68F', 'color': 'black', 'fontWeight': '600', 'borderRadius': '5px', 'margin': '5px', 'marginTop': '10px' }} onClick={() => onNextStepClick()}>Confirm {city.name}</button></span>
                </div>
              :
              this.isRefined(refinements) ?
                <div>
                  <span data-tip="Please first refine your preferences!"><button disabled={true} style={{ 'backgroundColor': 'lightgray', 'fontWeight': '600', 'borderRadius': '5px', 'margin': '5px', 'marginTop': '10px' }}>{city.name}</button></span>
                  <span data-tip={disabledContinueText}><button style={{ 'fontWeight': '600', 'borderRadius': '0px',  'marginRight': '5px', 'marginTop': '10px' }} onClick={() => onCritiqueClick(false)} disabled={true}>Continue Recommendation with Adjustments</button></span>
                </div>
                :
                <div>
                  <span data-tip="Please first refine your preferences!"><button disabled={true} style={{ 'backgroundColor': 'lightgray', 'fontWeight': '600', 'borderRadius': '5px', 'margin': '5px', 'marginTop': '10px' }}>{city.name}</button></span>
                  <span data-tip={continueText}><button style={{ 'backgroundColor': '#474bde', 'color': 'white', 'fontWeight': '600', 'borderRadius': '5px', 'marginTop': '10px' }} onClick={() => onCritiqueClick(false)}>Continue Recommendation with Adjustments</button></span>
                </div>
          }
          <HintMessage>How did you find the below aspects of the recommendation?<br /> You will see the outcome of the adjustments in the next step.</HintMessage>
          <ReactTooltip place="top" type="dark" effect="solid" />

          {isLoading ?
            <Spinner /> :
            <div>
              <Refiner>
                <ScoreRefiner
                  aspectName={aspects[0].aspectName}
                  aspectCodeName={aspects[0].aspectCodeName}
                  handleRefinementAction={handleRefinementAction}
                  selectedValue={refinements[aspects[0].aspectCodeName]}
                />
              </Refiner>
              <Refiner>
                <ScoreRefiner
                  aspectName={aspects[1].aspectName}
                  aspectCodeName={aspects[1].aspectCodeName}
                  handleRefinementAction={handleRefinementAction}
                  selectedValue={refinements[aspects[1].aspectCodeName]}
                />
              </Refiner>
              <Refiner>
                <ScoreRefiner
                  aspectName={aspects[2].aspectName}
                  aspectCodeName={aspects[2].aspectCodeName}
                  handleRefinementAction={handleRefinementAction}
                  selectedValue={refinements[aspects[2].aspectCodeName]}
                />
              </Refiner>
              <Refiner>
                <ScoreRefiner
                  aspectName={aspects[3].aspectName}
                  aspectCodeName={aspects[3].aspectCodeName}
                  handleRefinementAction={handleRefinementAction}
                  selectedValue={refinements[aspects[3].aspectCodeName]}
                />
              </Refiner>
              <Refiner>
                <ScoreRefiner
                  aspectName={aspects[4].aspectName}
                  aspectCodeName={aspects[4].aspectCodeName}
                  handleRefinementAction={handleRefinementAction}
                  selectedValue={refinements[aspects[4].aspectCodeName]}
                />
              </Refiner>
              <Refiner>
                <ScoreRefiner
                  aspectName={aspects[5].aspectName}
                  aspectCodeName={aspects[5].aspectCodeName}
                  handleRefinementAction={handleRefinementAction}
                  selectedValue={refinements[aspects[5].aspectCodeName]}
                />
              </Refiner>
            </div>
          }
        </CenteredContainer>
      </div>
    );
  }
}

export default RefiningPage;