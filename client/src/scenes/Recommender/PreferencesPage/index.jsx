import React from 'react';
import { StandardRow, StandardSmallContainer } from '../../../CommonStyles';
import { CenteredContainer, BannerWithMargin } from '../styles';
import SmallCity from './SmallCity';
import Spinner from '../../../components/Spinner';
import styled from 'styled-components';

const RefreshMessageContainer = styled.div`
  display: inline-flex;
  margin-top: 10px;
  align-items: center;

  & span {
    font-size: 14px;
    color: ${p => p.theme.primaryText};
    text-align: center;
  }
`;

const StyledButton = styled.button`
  background-color: transparent;
  transition: all 200ms ease-in-out;
  font-size: 10px;
  font-weight: 700;
  padding: 6px 25px;
  letter-spacing: 2.8px;
  color: ${p => p.theme.secondaryText};
  border: 1px solid ${p => p.theme.secondaryText}80;
  border-radius: 100px;
  cursor: pointer;
  text-transform: uppercase;
  margin-left: 15px;

  &, :hover, :focus, :active {
    outline: none;
  }

  &:hover {
    background-color: #fff3cd;
    color: #856404;
    border-color: #efd892;
  }
`;

class PreferencesPage extends React.Component {
  componentDidMount() {
    const { cities, getCities, startTimeTracking } = this.props;
    if (cities.length === 0) {
      getCities();
      startTimeTracking();
    }
  }

  toggleCitySelection = cityId => () => {
    const { toggleCitySelection } = this.props;
    toggleCitySelection(cityId);
  }

  onRefreshCitiesClick = () => {
    const { recordCityRefresh, resetSelectedCities, getCities } = this.props;
    recordCityRefresh();
    resetSelectedCities();
    getCities();
  }

  render () {
    const { cities, selectedCities, isLoading } = this.props;
    const renderedCities = cities.map(c => 
      <StandardSmallContainer key={c.id}>
        <SmallCity city={c} onClick={this.toggleCitySelection(c.id)} isSelected={selectedCities.has(c.id)}/>
      </StandardSmallContainer>);

    return (
      <CenteredContainer>
        <StandardRow>
          Imagine you want to travel to a city, but don't know yet where to go.<br />
          In this first step, select cities that are appealing to you irrespective of how far they might be away and how likely you are to visit them any time soon.
        </StandardRow>
        <BannerWithMargin margin={15}>Tell us your preferences! Please select 3 to 5 cities from the list below, which you like best.<br />You should select cities regardless of whether you have already visited them or not.</BannerWithMargin>
        {isLoading
          ? <Spinner />
          :
            <React.Fragment>
              <StandardRow>{renderedCities}</StandardRow>
              <RefreshMessageContainer>
                <span>Didn't recognize any of the cities above?</span>
                <StyledButton onClick={this.onRefreshCitiesClick}>Try out other cities</StyledButton>
              </RefreshMessageContainer>
            </React.Fragment>
        }
      </CenteredContainer>
    );
  }
}

export default PreferencesPage;