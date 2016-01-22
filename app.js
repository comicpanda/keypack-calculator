var toInt = function (num) {
  return parseInt(num, 10)
}
var discountRate = function (a, b) {
  if (isNaN(a / b) || !isFinite(a / b)) {
    return 0
  }
  return Math.round((a / b) * 100)
}

var UserInfo = React.createClass({
  render: function () {
    return (
      <table className="table table-bordered">
        <thead>
        <td>Purchased Key Count</td>
        <td>Earned Free Key Count</td>
        </thead>
        <tr>
          <td>
            {this.props.info.purchasedKeyCnt}
          </td>
          <td>
            {this.props.info.earnedFreeKeyCnt}
          </td>
        </tr>
      </table>
    )
  }
})

var KeyTiers = React.createClass({
  getInitialState: function () {
    return {
      keyCount: 0,
      discount: 0
    }
  },

  onChange: function () {
    this.updateState(this.refs.keycnt.value, this.refs.discount.value)
  },

  updateState: function (keyCount, discount) {
    keyCount = toInt(keyCount)
    discount = Math.min(Math.max(toInt(discount), 0), 100)
    this.setState({keyCount, discount})
  },

  render: function () {
    var createItem = function (item) {
      return (<tr key={item.id}>
        <td>{item.keyCount}</td>
        <td>{item.discount}%</td>
        <td>{item.action === 'N' ? '' : <button type="button" className="btn btn-sm btn-danger" onClick={() => {
          this.props.deleteKeyTier(item)
        }}>Delete</button>}</td>
      </tr>)
    }
    return (
      <table className="table table-bordered">
        <thead>
        <td>Key Count</td>
        <td>Discount Rate</td>
        <td>action</td>
        </thead>
        <tbody>
        {this.props.items.map(createItem.bind(this))}
        <tr>
          <td colSpan="4" className="center">Add new KeyTier</td>
        </tr>
        <tr>
          <td>
            <input type="number" min="0" ref="keycnt" onChange={this.onChange} value={this.state.keyCount}/>
          </td>
          <td>
            <input type="number" min="0" ref="discount" onChange={this.onChange} value={this.state.discount}/>
          </td>
          <td>
            <button type="button" className="btn btn-sm btn-info" onClick={() => {
              const keyCount = this.state.keyCount
              const exists = this.props.items.filter(function(item) {
                return item.keyCount == keyCount
              }).length > 0
              if (keyCount > 1 && !exists) {
                this.props.addKeyTier(keyCount, this.state.discount)
                this.updateState(0,0)
              }
            }}>Add
            </button>
          </td>
        </tr>
        </tbody>
      </table>
    )
  }
})

var SeriesInfo = React.createClass({
  onChange: function () {
    const totalEpisodeCnt    = Math.max(this.refs.episodes.value, 0),
          freeKeyMaxCnt      = Math.min(totalEpisodeCnt, Math.max(this.refs.freekey.value, 0)),
          freeEpisodeKeyCnt  = Math.min(freeKeyMaxCnt, Math.max(this.refs.freeepisode.value, 0)),
          pricePerKeyInCoins = this.refs.perkey.value;

    this.props.onChange({
      totalEpisodeCnt   : toInt(totalEpisodeCnt),
      freeKeyMaxCnt     : toInt(freeKeyMaxCnt),
      freeEpisodeKeyCnt : toInt(freeEpisodeKeyCnt),
      pricePerKeyInCoins: toInt(pricePerKeyInCoins)
    })
  },

  render: function () {
    const info = this.props.info
    return (
      <table className="table table-bordered">
        <thead>
        <td>EpisodeCnt</td>
        <td>FreeKeyMaxCnt<br></br>
          <small>(remaining free key : {info.freeKeyMaxCnt - info.freeEpisodeKeyCnt})</small>
        </td>
        <td>FreeEpisodeCnt<br></br>
          <small>(Initially)</small>
        </td>
        <td>PricePerKeyInCoins</td>
        <td>PriceInCoins</td>
        </thead>
        <tr>
          <td>
            <input type="number" min="0" ref="episodes" onChange={this.onChange} value={info.totalEpisodeCnt}/>
          </td>
          <td>
            <input type="number" min="0" ref="freekey" onChange={this.onChange} value={info.freeKeyMaxCnt}/>
          </td>
          <td>
            <input type="number" min="0" ref="freeepisode" onChange={this.onChange} value={info.freeEpisodeKeyCnt}/>
          </td>
          <td>
            <input type="number" min="0" ref="perkey" onChange={this.onChange} value={info.pricePerKeyInCoins}/>
          </td>
          <td>{(info.totalEpisodeCnt - info.freeKeyMaxCnt) * info.pricePerKeyInCoins}</td>
        </tr>
      </table>
    )
  }
})

var KeyPack = React.createClass({
  render: function () {
    var createKeypack = function (keypack) {
      return (
        <tr>
          <td>{keypack.keyCount}</td>
          <td className={keypack.originalCoins > keypack.coins
            ? 'line-through': ''}>{keypack.originalCoins}</td>
          <td>{keypack.coins}</td>
          <td>
            <button type="button" className="btn btn-sm btn-primary"
                    onClick={() => { this.props.buy(this.props.keypacks,keypack.id)}}>Buy
            </button>
          </td>
        </tr>
      )
    }
    return (
      <table className="table table-bordered">
        <thead>
        <td>Keypack</td>
        <td>Original Coins</td>
        <td>Coins</td>
        <td>buy</td>
        </thead>
        <tbody>
        {this.props.keypacks.length > 0 ? this.props.keypacks.map(createKeypack.bind(this)) :
          <tr className="center">
            <td colSpan="4">No more..</td>
          </tr>}
        </tbody>
      </table>
    )
  }
})

var FreeKey = React.createClass({
  render() {
    return (
      <div className="ib">
        <button type="button" className="btn btn-success" onClick={this.props.earnedFreeKey}>{this.props.title}</button>
      </div>
    )
  }
})

var KeyPackCalculator = React.createClass({
  getInitialState: function () {
    var state = {
      coinPerDollars: 1000,
      keyTiers      : [
        {action: 'N', keyCount: 1, id: 1, discount: 0},
        {action: 'A', keyCount: 5, id: 2, discount: 0},
        {action: 'A', keyCount: 10, id: 3, discount: 5},
        {action: 'A', keyCount: 20, id: 4, discount: 10}
      ],
      seriesInfo    : {totalEpisodeCnt: 50, freeKeyMaxCnt: 10, freeEpisodeKeyCnt: 3, pricePerKeyInCoins: 250},
      userInfo      : {earnedFreeKeyCnt: 0, purchasedKeyCnt: 0, spentCoins: 0},
      purchasedLogs : []
    }
    state.userInfo.earnedFreeKeyCnt = state.seriesInfo.freeEpisodeKeyCnt
    return state
  },

  setSeriesInfo: function (newInfo) {
    this.setState({
      seriesInfo: newInfo,
      userInfo  : {
        earnedFreeKeyCnt: this.state.userInfo.earnedFreeKeyCnt +
        (newInfo.freeEpisodeKeyCnt - this.state.seriesInfo.freeEpisodeKeyCnt),
        purchasedKeyCnt : this.state.userInfo.purchasedKeyCnt,
        spentCoins      : this.state.userInfo.spentCoins
      }
    })
  },

  onChangeCoinPerDollars(e) {
    this.setState({coinPerDollars: e.target.value})
  },

  deleteKeyTier(deletedKeyTier) {
    this.setState(
      {
        keyTiers: this.state.keyTiers.filter(function (keyTier) {
          return keyTier.id !== deletedKeyTier.id
        })
      })
  },

  addKeyTier(keyCount, discount) {
    var keyTiers = this.state.keyTiers
    keyTiers.push({
      action  : 'A',
      keyCount: keyCount,
      discount: discount,
      id      : Date.now()
    })
    keyTiers.sort(function (a, b) {
      return toInt(a.keyCount) - toInt(b.keyCount)
    })
    this.setState({keyTiers})
  },

  buy(keyPacks, id) {
    let keyPack = keyPacks.filter(kp => {
      return kp.id === id
    })[0]

    var purchasedKeyCnt = keyPack.keyCount
    var earnedFreeKeyCnt = 0
    // In this case.. 0 is buyall pack's id.
    if (keyPack.id === 0) {
      earnedFreeKeyCnt = Math.max(this.state.seriesInfo.freeKeyMaxCnt - this.state.userInfo.earnedFreeKeyCnt, 0)
      purchasedKeyCnt -= earnedFreeKeyCnt
    }
    var purchasedLogs = [` ${this.state.purchasedLogs.length + 1}: ${keyPack.keyCount} keys - ${keyPack.coins} coins`]
    purchasedLogs.push(...this.state.purchasedLogs)
    this.setState({
      userInfo: {
        earnedFreeKeyCnt: this.state.userInfo.earnedFreeKeyCnt + earnedFreeKeyCnt,
        purchasedKeyCnt : this.state.userInfo.purchasedKeyCnt + purchasedKeyCnt,
        spentCoins      : this.state.userInfo.spentCoins + keyPack.coins
      }, purchasedLogs
    })
  },

  earnedFreeKey() {
    this.setState({
      userInfo: {
        earnedFreeKeyCnt: this.state.userInfo.earnedFreeKeyCnt + 1,
        purchasedKeyCnt : this.state.userInfo.purchasedKeyCnt
      }
    })
  },

  render: function () {
    var userInfo            = this.state.userInfo,
        seriesInfo          = this.state.seriesInfo,
        remainingFreeKeyCnt = Math.max(seriesInfo.freeKeyMaxCnt - userInfo.earnedFreeKeyCnt, 0),
        issuedKeyCnt        = userInfo.purchasedKeyCnt + userInfo.earnedFreeKeyCnt,
        remainingKeyCnt     = seriesInfo.totalEpisodeCnt - issuedKeyCnt,
        paidKeyCnt          = seriesInfo.totalEpisodeCnt - seriesInfo.freeKeyMaxCnt,
        lastKeyTier         = this.state.keyTiers.slice(-1)[0],
        realKeyPrice        = this.state.seriesInfo.pricePerKeyInCoins,
        aKeyPrice           = Math.round(realKeyPrice / ((100 - lastKeyTier.discount) / 100))

    console.log({
      remainingFreeKeyCnt,
      issuedKeyCnt,
      remainingKeyCnt,
      paidKeyCnt,
      lastKeyTier,
      realKeyPrice,
      aKeyPrice
    })

    var keypacks = function () {
      if (remainingKeyCnt === 0) {
        return []
      }
      var candidateKeypacks = [{
        id: 1, keyCount: 1, originalCoins: aKeyPrice, coins: aKeyPrice
      }]

      if (remainingKeyCnt === 1) {
        return candidateKeypacks
      }

      const keyTiers = this.state.keyTiers.filter(function (kt) {
        return kt.action !== 'N' && kt.keyCount < remainingKeyCnt
      })
      const tierSize = keyTiers.length

      if (tierSize > 0) {

        var firstCnt = keyTiers[0].keyCount
        keyTiers.map(function (ckt) {
          if (remainingKeyCnt > ckt.keyCount + firstCnt &&
              remainingKeyCnt-remainingFreeKeyCnt > ckt.keyCount) {


            candidateKeypacks.push({
              id           : ckt.id,
              keyCount     : ckt.keyCount,
              originalCoins: ckt.keyCount * aKeyPrice,
              coins        : ckt.keyCount * (ckt.discount === 0 ? aKeyPrice : aKeyPrice - Math.round(aKeyPrice * (ckt.discount / 100)))
            })
          }
        })
      }

      candidateKeypacks.push({
        id           : 0,
        keyCount     : remainingKeyCnt,
        originalCoins: remainingKeyCnt * aKeyPrice,
        coins        : Math.max(remainingKeyCnt-remainingFreeKeyCnt, 2) * realKeyPrice
      })

      return candidateKeypacks
    }.bind(this)()

    return (
      <div>
        <h1>KeyPack Calculator</h1>
        <div className="flex">
          <div className="meta">
            coin per dollars
            <input type="number" onChange={this.onChangeCoinPerDollars} value={this.state.coinPerDollars}/>
            <h3>Series Info
              &nbsp;
              <small>(keyPack 1 - {aKeyPrice} coins. Real value : {realKeyPrice} coins). Paid Key Count
                : {paidKeyCnt} </small>
            </h3>
            <SeriesInfo info={seriesInfo} onChange={this.setSeriesInfo}/>
            <h3>KeyTiers</h3>
            <KeyTiers items={this.state.keyTiers} deleteKeyTier={this.deleteKeyTier} addKeyTier={this.addKeyTier}/>
            <h3>User Info
              &nbsp;
              <small>(spending {userInfo.spentCoins} coins)</small>
            </h3>
            <UserInfo info={userInfo}/>
          </div>
          <div className="dp">
            <h4>Remaining Keys - including freeKey : {remainingKeyCnt} / excluding freeKey : {Math.max(remainingKeyCnt -
              remainingFreeKeyCnt, 0)}</h4>
            <h3>KeyPack</h3>
            <KeyPack keypacks={keypacks} buy={this.buy}/>
            <h3>Get A Free Key
              &nbsp;
              <small>(Remaining free keys {remainingFreeKeyCnt})</small>
            </h3>
            { (() => {
              if (remainingFreeKeyCnt > 0) {
                return (
                  <div>
                    <FreeKey title="Tapjoy video" earnedFreeKey={this.earnedFreeKey}/>
                    <FreeKey title="Campaign" earnedFreeKey={this.earnedFreeKey }/>
                    <FreeKey title="Gift" earnedFreeKey={this.earnedFreeKey}/>
                  </div>)
              } else {
                return 'No more...'
              }
            })()
            }
            <h3>Purchase Logs</h3>
            {this.state.purchasedLogs.map(function (log) {
              return (<p>{log}</p>)
            })}
          </div>
        </div>
      </div>
    )
  }
})

ReactDOM.render(<KeyPackCalculator />, document.getElementById('root'))
