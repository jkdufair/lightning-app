/* eslint-disable no-console, react/no-danger */
import React from 'react'
import reactCSS from 'reactcss'
import { connect } from 'react-redux'
import { withRouter } from 'react-router'
import { store } from 'lightning-store'

import { Box, Text } from 'lightning-components'
import { actions as accountActions } from '../accounts'
import NavLinks from './NavLinks'
import NavFooter from './NavFooter'

export class Sidebar extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      syncProgress: 0,
      fetchAccount: undefined,
      initialWalletBestBlockTimestamp: 0
    }
  }

  componentDidMount() {
    this.props.fetchAccount()
      .catch(console.error)
    this.props.location.pathname !== '/accounts' && this.props.fetchBalances()
    !this.props.isSynced &&
      this.setState({ fetchAccountInterval: setInterval(this.props.fetchAccount, 1000) })
  }

  componentWillReceiveProps(nextProps) {
    const { isSynced, walletBestBlockTimestamp, blockHeight } = this.props
    const { fetchAccountInterval, initialWalletBestBlockTimestamp } = this.state
    if (initialWalletBestBlockTimestamp === 0 && walletBestBlockTimestamp)
      this.setState({ initialWalletBestBlockTimestamp: walletBestBlockTimestamp }, () => {
        setSyncProgress(this.state.initialWalletBestBlockTimestamp, walletBestBlockTimestamp)
      })
    !isSynced &&
      nextProps.isSynced &&
      clearInterval(fetchAccountInterval) &&
      this.setState({ fetchAccountInterval: undefined })
    this.setSyncProgress(initialWalletBestBlockTimestamp, walletBestBlockTimestamp)
  }

  setSyncProgress(initialWalletBestBlockTimestamp, walletBestBlockTimestamp) {
    this.setState({
      syncProgress: (walletBestBlockTimestamp - initialWalletBestBlockTimestamp) /
        (Math.round((new Date()).getTime() / 1000) - initialWalletBestBlockTimestamp) * 100 
    })
  }

  render() {
    const { navigateToSubpage, currency, pubkey, balances, isSynced,
      serverRunning } = this.props
    const { syncProgress } = this.state
    const styles = reactCSS({
      'default': {
        sidebar: {
          direction: 'column',
          spread: true,
          flex: 1,
        },
        section: {
          padding: 'small',
        },
        synced: {
          background: 'dark-teal',
          direction: 'column',
          align: 'center',
          verticalAlign: 'center',
          marginLeft: -7,
          marginTop: 7,
          marginRight: -7,
          marginBottom: -7,
          borderBottomLeftRadius: 4,
          height: 34,
          position: 'relative'
        },
        progress: {
          position: 'absolute',
          background: 'blue',
          height: 34,
          width: `${syncProgress}%`,
          alignSelf: 'flex-start'
        },
        syncedText: {
          color: 'black',
          size: 'small',
          zIndex: 2
        },
      },
    })

    return (
      <Box style={ styles.sidebar }>
        <Box style={ styles.section }>
          <NavLinks onChange={ navigateToSubpage } />
        </Box>
        <Box style={ styles.section }>
          { pubkey ? (
            <NavFooter
              balances={ balances }
              pubkey={ pubkey }
              currency={ currency }
              onClickAccount={ navigateToSubpage }
            />
          ) : null }

          { serverRunning && isSynced ? null : (
            <Box style={ styles.synced } className="syncing">
              <Text style={ styles.syncedText }>Syncing to Chain</Text>
              <Box style={styles.progress} />
            </Box>
          ) }
        </Box>
      </Box>
    )
  }
}

export default withRouter(connect(
  state => ({
    serverRunning: store.getServerRunning(state),
    isSynced: store.getSyncedToChain(state),
    walletBestBlockTimestamp: store.getWalletBestBlockTimestamp(state),
    blockHeight: store.getBlockHeight(state),
    pubkey: store.getAccountPubkey(state),
    currency: store.getCurrency(state),
    balances: store.getAccountBalances(state),
  }), {
    fetchAccount: accountActions.fetchAccount,
    fetchBalances: accountActions.fetchBalances,
  },
)(Sidebar))
