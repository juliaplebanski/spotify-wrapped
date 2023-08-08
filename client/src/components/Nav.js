import React from "react";
import { Link } from "@reach/router";

import {
  IconSpotify,
  IconUser,
} from "./icons";

import styled from "styled-components/macro";
import { theme, mixins, media } from "../styles";
const { colors } = theme;

const Container = styled.nav`
  ${mixins.coverShadow};
  ${mixins.flexBetween};
  flex-direction: column;
  min-height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  width: ${theme.navWidth};
  background-color: ${colors.navBlack};
  text-align: center;
  z-index: 99;
  ${media.tablet`
    top: auto;
    bottom: 0;
    right: 0;
    width: 100%;
    min-height: ${theme.navHeight};
    height: ${theme.navHeight};
    flex-direction: row;
  `};
  & > * {
    width: 100%;
    ${media.tablet`
      height: 100%;
    `};
  }
`;
const Logo = styled.div`
  color: ${colors.green};
  margin-top: 30px;
  width: 70px;
  height: 70px;
  transition: ${theme.transition};
  ${media.tablet`
    display: none;
  `};
  &:hover,
  &:focus {
    color: ${colors.offGreen};
  }
  svg {
    width: 50px;
  }
`;
const Menu = styled.ul`
  display: flex;
  flex-direction: column;
  ${media.tablet`
    flex-direction: row;
    align-items: flex-end;
    justify-content: center;
  `};
`;
const MenuItem = styled.li`
  color: ${colors.lightGrey};
  font-size: 11px;
  ${media.tablet`
    flex-grow: 1;
    flex-basis: 100%;
    height: 100%;
  `};
  a {
    display: block;
    padding: 15px 0;
    border-left: 5px solid transparent;
    width: 100%;
    height: 100%;
    ${media.tablet`
      ${mixins.flexCenter};
      flex-direction: column;
      padding: 0;
      border-left: 0;
      border-top: 3px solid transparent;
    `};
    &:hover,
    &:focus,
    &.active {
      color: ${colors.white};
      background-color: ${colors.black};
      border-left: 5px solid ${colors.offGreen};
      ${media.tablet`
        border-left: 0;
        border-top: 3px solid ${colors.offGreen};
      `};
    }
  }
  svg {
    width: 20px;
    height: 20px;
    margin-bottom: 7px;
  }
`;


const Nav = () => (
  <Container>
    <Logo>
      <Link to="/">
        <IconSpotify />
      </Link>
    </Logo>
  </Container>
);

export default Nav;
