import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { remove } from 'tiny-cookie'
import { Dropdown } from 'react-bootstrap'

import isPath from '../../util/isPath'
import Button from '../Button/Button'
import PortalLinkContainer from '../../containers/PortalLinkContainer/PortalLinkContainer'
import { getEnvironmentConfig } from '../../../../../sharedUtils/config'
import { cmrEnv } from '../../../../../sharedUtils/cmrEnv'

import './SecondaryToolbar.scss'
import { portalPath } from '../../../../../sharedUtils/portalPath'

class SecondaryToolbar extends Component {
  constructor(props) {
    super(props)

    const { savedProject } = props
    const { name = '' } = savedProject

    this.state = {
      projectDropdownOpen: false,
      projectName: name || 'Untitled Project'
    }

    this.handleLogout = this.handleLogout.bind(this)
    this.onToggleProjectDropdown = this.onToggleProjectDropdown.bind(this)
    this.onInputChange = this.onInputChange.bind(this)
    this.handleNameSubmit = this.handleNameSubmit.bind(this)
    this.handleKeypress = this.handleKeypress.bind(this)
  }

  componentWillReceiveProps(nextProps) {
    const { savedProject } = this.props
    const { name } = savedProject

    const { savedProject: nextSavedProject } = nextProps
    const { name: nextName } = nextSavedProject

    if (name !== nextName) this.setState({ projectName: nextName })
  }

  onToggleProjectDropdown() {
    const { projectDropdownOpen } = this.state

    this.setState({
      projectDropdownOpen: !projectDropdownOpen
    })
  }

  onInputChange(event) {
    this.setState({ projectName: event.target.value })
  }

  /**
   * Remove the authToken cookie
   */
  handleLogout() {
    remove('authToken')
  }

  handleNameSubmit() {
    const { onUpdateProjectName } = this.props
    const { projectName } = this.state

    const newName = projectName || 'Untitled Project'

    this.setState({
      projectDropdownOpen: false,
      projectName: newName
    })

    onUpdateProjectName(projectName)
  }

  handleKeypress(event) {
    if (event.key === 'Enter') {
      this.handleNameSubmit()
      event.stopPropagation()
      event.preventDefault()
    }
  }

  render() {
    const { projectDropdownOpen, projectName } = this.state
    const {
      authToken,
      projectIds,
      location,
      portal
    } = this.props

    const loggedIn = authToken !== ''
    const returnPath = window.location.href

    const { apiHost } = getEnvironmentConfig()
    const cmrEnvironment = cmrEnv()

    const backLink = (
      <PortalLinkContainer
        className="collection-results__item-title-link"
        to={{
          pathname: '/search',
          search: window.location.search
        }}
      >
        <Button
          className="secondary-toolbar__back"
          bootstrapVariant="light"
          icon="arrow-circle-o-left"
          label="Back to Search"
        >
          Back to Search
        </Button>
      </PortalLinkContainer>
    )

    const buildProjectLink = (loggedIn) => {
      if (!loggedIn) {
        const projectPath = `${window.location.protocol}//${window.location.host}/projects${window.location.search}`
        return (
          <Button
            className="secondary-toolbar__project"
            bootstrapVariant="light"
            href={`${apiHost}/login?cmr_env=${cmrEnvironment}&state=${encodeURIComponent(projectPath)}`}
            label="View Project"
          >
            My Project
          </Button>
        )
      }
      return (
        <PortalLinkContainer
          className="collection-results__item-title-link"
          to={{
            pathname: '/projects',
            search: window.location.search
          }}
        >
          <Button
            className="secondary-toolbar__project"
            bootstrapVariant="light"
            label="View Project"
          >
            My Project
          </Button>
        </PortalLinkContainer>
      )
    }

    const projectLink = buildProjectLink(loggedIn)

    const loginLink = (
      <Button
        className="secondary-toolbar__login"
        bootstrapVariant="light"
        href={`${apiHost}/login?cmr_env=${cmrEnvironment}&state=${encodeURIComponent(returnPath)}`}
        icon="lock"
        label="Login"
      >
        Earthdata Login
      </Button>
    )

    const loggedInDropdown = (
      <Dropdown className="secondary-toolbar__user-dropdown">
        <Dropdown.Toggle
          className="secondary-toolbar__user-dropdown-toggle"
          variant="light"
        >
          <i className="fa fa-user" />
        </Dropdown.Toggle>
        <Dropdown.Menu>
          <Dropdown.Item
            className="secondary-toolbar__downloads"
            href={`${portalPath(portal)}/downloads`}
          >
            Download Status &amp; History
          </Dropdown.Item>
          <Dropdown.Item
            className="secondary-toolbar__saved-projects"
            href={`${portalPath(portal)}/saved_projects`}
          >
            Saved Projects
          </Dropdown.Item>
          <Dropdown.Item
            className="secondary-toolbar__logout"
            onClick={this.handleLogout}
            href={`${portalPath(portal)}/`}
          >
            Logout
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    )

    const saveProjectDropdown = (
      <Dropdown
        show={projectDropdownOpen}
        className="secondary-toolbar__project-name-dropdown"
        alignRight
      >
        <Dropdown.Toggle
          className="secondary-toolbar__project-name-dropdown-toggle"
          variant="light"
          onClick={this.onToggleProjectDropdown}
        >
          <i className="fa fa-floppy-o" />
        </Dropdown.Toggle>
        <Dropdown.Menu>
          <span>
            <input
              className="secondary-toolbar__project-name-input"
              name="projectName"
              value={projectName}
              onChange={this.onInputChange}
              onKeyPress={this.handleKeypress}
            />
            <Button
              className="secondary-toolbar__button secondary-toolbar__button--submit"
              bootstrapVariant="primary"
              label="Save project name"
              onClick={this.handleNameSubmit}
            >
              Save
            </Button>
          </span>
        </Dropdown.Menu>
      </Dropdown>
    )

    return (
      <section className="secondary-toolbar">
        {
          isPath(location.pathname, ['/projects']) && backLink
        }
        {
          (!isPath(location.pathname, ['/projects']) && projectIds.length > 0) && projectLink
        }
        {
          isPath(location.pathname, ['/search']) && loggedIn && saveProjectDropdown
        }
        {
          !loggedIn ? loginLink : loggedInDropdown
        }
      </section>
    )
  }
}

SecondaryToolbar.propTypes = {
  authToken: PropTypes.string.isRequired,
  projectIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  location: PropTypes.shape({}).isRequired,
  portal: PropTypes.shape({}).isRequired,
  savedProject: PropTypes.shape({}).isRequired,
  onUpdateProjectName: PropTypes.func.isRequired
}

export default SecondaryToolbar
