// @flow
import * as I from 'immutable'
import * as SearchGen from '../actions/search-gen'
import {amIFollowing, usernameSelector} from './selectors'
import {type IconType} from '../common-adapters/icon'
import {createSelector} from 'reselect'
import {type TypedState} from './reducer'

const services: {[service: string]: true} = {
  Facebook: true,
  GitHub: true,
  'Hacker News': true,
  Keybase: true,
  Reddit: true,
  Twitter: true,
}

export type Service = $Keys<typeof services>

export type FollowingState = 'Following' | 'NotFollowing' | 'NoState' | 'You'

// This is what the api expects/returns
export type SearchPlatform = 'Keybase' | 'Twitter' | 'Github' | 'Reddit' | 'Hackernews' | 'Pgp' | 'Facebook'

export type SearchResultId = string // i.e. marcopolo or marcopolo@github
export type SearchQuery = string

export type RowProps = {
  id: SearchResultId,

  leftFollowingState: FollowingState,
  leftIcon: ?IconType, // If service is keybase this can be null
  leftService: Service,
  leftUsername: string,

  rightFollowingState: FollowingState,
  rightFullname: ?string,
  rightIcon: ?IconType,
  rightService: ?Service,
  rightUsername: ?string,

  showTrackerButton: boolean,
  onShowTracker: () => void,
  onClick: () => void,
  onMouseOver?: () => void,
  selected: boolean,
  userIsInTeam: boolean,
}

// A normalized version of the row props above.
// The connector should fill in the missing pieces like the following state
export type SearchResult = {
  id: SearchResultId,

  leftIcon: ?IconType, // If service is keybase this can be null
  leftService: Service,
  leftUsername: string,

  rightFullname: ?string,
  rightIcon: ?IconType,
  rightService: ?Service,
  rightUsername: ?string,
}

export const makeSearchResult: I.RecordFactory<SearchResult> = I.Record({
  id: '',

  leftIcon: null,
  leftService: 'Keybase',
  leftUsername: '',

  rightFullname: null,
  rightIcon: null,
  rightService: null,
  rightUsername: null,
})

function serviceIdToService(serviceId: string): Service {
  return {
    keybase: 'Keybase',
    twitter: 'Twitter',
    github: 'GitHub',
    reddit: 'Reddit',
    hackernews: 'Hacker News',
    facebook: 'Facebook',
  }[serviceId]
}

function followStateHelper(state: TypedState, username: string, service: Service) {
  const me = usernameSelector(state)
  if (service === 'Keybase') {
    if (username === me) {
      return 'You'
    } else {
      return amIFollowing(state, username) ? 'Following' : 'NotFollowing'
    }
  }
  return 'NoState'
}

function maybeUpgradeSearchResultIdToKeybaseId(
  searchResultMap: $PropertyType<$PropertyType<TypedState, 'entities'>, 'searchResults'>,
  id: SearchResultId
): SearchResultId {
  const searchResult = searchResultMap.get(id)
  if (searchResult) {
    if (searchResult.leftService === 'Keybase') {
      return searchResult.leftUsername
    } else if (searchResult.rightService === 'Keybase') {
      return searchResult.rightUsername || id
    }
  }

  return id
}

function platformToIcon(service: Service): IconType {
  return {
    Keybase: 'iconfont-identity-devices',
    Twitter: 'iconfont-identity-twitter',
    Github: 'iconfont-identity-github',
    Reddit: 'iconfont-identity-reddit',
    Hackernews: 'iconfont-identity-hn',
    Pgp: 'iconfont-identity-pgp',
    Facebook: 'iconfont-identity-facebook',
  }[service]
}

function platformToLogo32(service: Service): IconType {
  return {
    Keybase: 'icon-keybase-logo-32',
    Twitter: 'icon-twitter-logo-32',
    Github: 'icon-github-logo-32',
    Reddit: 'icon-reddit-logo-32',
    Hackernews: 'icon-hacker-news-logo-32',
    Pgp: 'icon-pgp-key-32',
    Facebook: 'icon-facebook-logo-32',
  }[service]
}

function platformToLogo24(service: Service): IconType {
  return {
    Keybase: 'icon-keybase-logo-24',
    Twitter: 'icon-twitter-logo-24',
    Github: 'icon-github-logo-24',
    Reddit: 'icon-reddit-logo-24',
    Hackernews: 'icon-hacker-news-logo-24',
    Pgp: 'icon-pgp-key-24',
    Facebook: 'icon-facebook-logo-24',
  }[service]
}

function platformToLogo16(service: Service): IconType {
  return {
    Keybase: 'icon-keybase-logo-16',
    Twitter: 'icon-twitter-logo-16',
    Github: 'icon-github-logo-16',
    Reddit: 'icon-reddit-logo-16',
    Hackernews: 'icon-hacker-news-logo-16',
    Pgp: 'icon-pgp-key-16',
    Facebook: 'icon-facebook-logo-16',
  }[service]
}

const isUserInputItemsUpdated = (searchKey: string) => (action: any) =>
  action.type === SearchGen.userInputItemsUpdated && action.payload && action.payload.searchKey === searchKey

const _getSearchResultIds = ({entities}: TypedState, {searchKey}: {searchKey: string}) =>
  entities.getIn(['search', 'searchKeyToResults', searchKey])

const getSearchResultIdsArray = createSelector(_getSearchResultIds, ids => ids && ids.toArray())

const getUserInputItemIdsOrderedSet = ({entities}: TypedState, {searchKey}: {searchKey: string}) =>
  entities.getIn(['search', 'searchKeyToUserInputItemIds', searchKey], I.OrderedSet())
const getUserInputItemIds = createSelector(getUserInputItemIdsOrderedSet, ids => ids && ids.toArray())

const getClearSearchTextInput = ({entities}: TypedState, {searchKey}: {searchKey: string}) =>
  entities.getIn(['search', 'searchKeyToClearSearchTextInput', searchKey], 0)

export {
  serviceIdToService,
  followStateHelper,
  maybeUpgradeSearchResultIdToKeybaseId,
  platformToIcon,
  platformToLogo32,
  platformToLogo24,
  platformToLogo16,
  getClearSearchTextInput,
  getSearchResultIdsArray,
  getUserInputItemIds,
  getUserInputItemIdsOrderedSet,
  isUserInputItemsUpdated,
}
